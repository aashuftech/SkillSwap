import "dotenv/config";
import mongoose from "mongoose";
import AiActivity from "./models/AiActivity.js";
import AiConversation from "./models/AiConversation.js";
import User from "./models/User.js";
import { auth, optionalAuth, adminOnly, adminEmails } from "./authMiddleware.js";

const skillRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true, index: true },
  teachSkill: { type: String, required: true, trim: true, maxlength: 120 },
  learnSkill: { type: String, required: true, trim: true, maxlength: 120 },
  aiAssessment: { verdict: { type: String, enum: ["approved", "rejected", "review"], required: true }, confidence: { type: Number, min: 0, max: 1, required: true }, reason: { type: String, required: true }, normalizedSkill: { type: String, required: true } },
  status: { type: String, enum: ["approved", "rejected", "review"], required: true },
  adminNote: { type: String, default: "" },
}, { timestamps: true });

const SkillRequest = mongoose.models.SkillRequest || mongoose.model("SkillRequest", skillRequestSchema);
const model = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const groqModels = () => [...new Set([
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "qwen/qwen3.8-27b",
  "groq/compound-mini",
].filter(Boolean))];
const cleanText = (value, limit = 3000) => typeof value === "string" ? value.trim().slice(0, limit) : "";

function identityFor(req, visitorId) {
  if (req.auth?.sub) return { userId: req.auth.sub };
  const cleanedVisitor = cleanText(visitorId, 120);
  return cleanedVisitor ? { visitorId: cleanedVisitor } : null;
}

const identityFilter = (identity) => identity.userId ? { userId: identity.userId } : { visitorId: identity.visitorId };
const logActivity = (identity, type, query = "", resultCount = 0) => AiActivity.create({ ...identity, type, query: cleanText(query), resultCount });

function parseJson(content) {
  if (!content) throw new Error("Empty response from AI");
  let str = String(content).trim();
  str = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    str = str.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(str);
}

async function groq(messages, options = {}) {
  if (!process.env.GROQ_API_KEY) throw new Error("AI is not configured. Add GROQ_API_KEY to the server .env file.");
  const candidateModels = groqModels();
  let lastFailure = "";

  for (const selectedModel of candidateModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel, temperature: options.temperature ?? 0.35, ...options, messages }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I could not generate a response right now.";
      }

      const details = await response.text();
      lastFailure = `Groq model ${selectedModel} failed (${response.status}): ${details.slice(0, 300)}`;
      // If unauthorized, don't keep retrying
      if (response.status === 401) throw new Error("Invalid GROQ_API_KEY provided.");
    } catch (err) {
      if (err.message === "Invalid GROQ_API_KEY provided.") throw err;
      lastFailure = err.message || lastFailure;
    }
  }

  throw new Error(lastFailure || "No configured Groq model is available for this API key.");
}

async function assessSkill(teachSkill, learnSkill) {
  const content = await groq([
    { role: "system", content: "You moderate SkillSwap skill requests. Return only JSON with verdict (approved|rejected|review), confidence (0 to 1), reason (short), normalizedSkill (short). Approve plausible teachable skills. Reject scams, illegal activities, hateful content, medical/legal/financial claims presented as professional advice, spam, and impossible/vague skills. Use review when uncertain." },
    { role: "user", content: JSON.stringify({ teachSkill, learnSkill }) },
  ], { temperature: 0, response_format: { type: "json_object" } });
  return parseJson(content);
}

function fallbackMatch(prompt, listings) {
  const words = prompt.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
  const ranked = listings.map((listing) => ({ id: String(listing.id), score: words.reduce((score, word) => score + Number(`${listing.name} ${listing.offer} ${listing.user}`.toLowerCase().includes(word)), 0) })).sort((a, b) => b.score - a.score);
  return { selectedIds: ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.id), summary: "I found the closest available skill swaps for your request." };
}

export function registerAdminAiRoutes(app) {
  // This confirms which server process is actually running without exposing the API key.
  app.get("/api/ai/health", (_req, res) => res.json({
    success: true,
    version: "skillswap-ai-groq-fallback-v2",
    keyConfigured: Boolean(process.env.GROQ_API_KEY),
    models: groqModels(),
  }));

  app.post("/api/skill-requests", auth, async (req, res, next) => {
    try {
      const { teachSkill, learnSkill } = req.body;
      if (!teachSkill?.trim() || !learnSkill?.trim()) return res.status(400).json({ success: false, message: "Teach and learn skills are required." });
      const aiAssessment = await assessSkill(teachSkill.trim(), learnSkill.trim());
      if (!["approved", "rejected", "review"].includes(aiAssessment.verdict)) throw new Error("AI returned an invalid verdict.");
      const request = await SkillRequest.create({ userEmail: req.auth.email, teachSkill: teachSkill.trim(), learnSkill: learnSkill.trim(), aiAssessment, status: aiAssessment.verdict });
      await logActivity({ userId: req.auth.sub }, "SKILL_REVIEW", `${teachSkill} -> ${learnSkill}`, 1);
      return res.status(201).json({ success: true, request });
    } catch (error) { return next(error); }
  });

  app.get("/api/skill-requests/mine", auth, async (req, res, next) => {
    try { return res.json({ success: true, requests: await SkillRequest.find({ userEmail: req.auth.email }).sort({ createdAt: -1 }) }); } catch (error) { return next(error); }
  });
  app.get("/api/admin/skill-requests", auth, adminOnly, async (_req, res, next) => {
    try { return res.json({ success: true, requests: await SkillRequest.find().sort({ createdAt: -1 }) }); } catch (error) { return next(error); }
  });
  app.patch("/api/admin/skill-requests/:id", auth, adminOnly, async (req, res, next) => {
    try {
      const { status, adminNote = "" } = req.body;
      if (!["approved", "rejected", "review"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status." });
      const request = await SkillRequest.findByIdAndUpdate(req.params.id, { status, adminNote: cleanText(adminNote, 1000) }, { returnDocument: "after", runValidators: true });
      if (!request) return res.status(404).json({ success: false, message: "Request not found." });
      return res.json({ success: true, request });
    } catch (error) { return next(error); }
  });

  app.get("/api/ai/conversation", optionalAuth, async (req, res, next) => {
    try {
      const identity = identityFor(req, req.query.visitorId);
      if (!identity) return res.json({ success: true, messages: [] });
      const conversation = await AiConversation.findOne(identityFilter(identity)).lean();
      return res.json({ success: true, messages: conversation?.messages || [] });
    } catch (error) { return next(error); }
  });

  // Actually clears the saved history in the DB (not just the on-screen
  // state), so it does not reappear on the next login / next time the
  // widget is opened.
  app.delete("/api/ai/conversation", optionalAuth, async (req, res, next) => {
    try {
      const identity = identityFor(req, req.query.visitorId);
      if (!identity) return res.status(400).json({ success: false, message: "No active chat session to clear." });
      await AiConversation.findOneAndUpdate(identityFilter(identity), { $set: { messages: [], lastActivityAt: new Date() } });
      return res.json({ success: true });
    } catch (error) { return next(error); }
  });

  app.post("/api/ai-chat", optionalAuth, async (req, res, next) => {
    try {
      const identity = identityFor(req, req.body.visitorId);
      const latestUserMessage = Array.isArray(req.body.messages) ? req.body.messages.filter((item) => item.role === "user").at(-1)?.content : "";
      const message = cleanText(req.body.message || latestUserMessage, 3000);
      if (!identity || !message) return res.status(400).json({ success: false, message: "A message and a user session (or visitor id) are required." });
      const filter = identityFilter(identity);
      const conversation = await AiConversation.findOne(filter);
      const history = (conversation?.messages || []).slice(-12).map(({ role, content }) => ({ role, content }));
      const reply = await groq([
        { role: "system", content: "You are SkillSwap AI, a warm, practical assistant for a peer-to-peer skill learning and exchange platform. Answer in the user's language: Hindi, English, or Hinglish. Help with discovering skills, creating a skill request, connecting with members, chats, payments, dashboards, and safety. Give clear numbered steps when explaining a platform action. Never claim an action is complete unless the user can do it themselves. Keep most replies under 160 words." },
        ...history,
        { role: "user", content: message },
      ]);
      const pair = [{ role: "user", content: message, createdAt: new Date() }, { role: "assistant", content: reply, createdAt: new Date() }];
      await AiConversation.findOneAndUpdate(filter, { $setOnInsert: identity, $push: { messages: { $each: pair, $slice: -80 } }, $set: { lastActivityAt: new Date() } }, { upsert: true, returnDocument: "after" });
      await logActivity(identity, "CHAT", message, 1);
      return res.json({ success: true, message: reply });
    } catch (error) { return next(error); }
  });

  app.post("/api/ai/skill-match", optionalAuth, async (req, res, next) => {
    try {
      const identity = identityFor(req, req.body.visitorId) || { visitorId: "anonymous" };
      const prompt = cleanText(req.body.prompt, 2000);
      const teachSkill = cleanText(req.body.teachSkill, 200);
      const learnSkill = cleanText(req.body.learnSkill, 200);

      if (!prompt && !learnSkill && !teachSkill) {
        return res.status(400).json({
          success: false,
          message: "Please tell us what skill you want to learn or teach.",
        });
      }

      const { performRagSkillMatch } = await import("./skillMatchRag.js");
      const ragResult = await performRagSkillMatch({
        prompt,
        teachSkill,
        learnSkill,
      });

      await logActivity(
        identity,
        "SKILL_SEARCH",
        prompt || `${teachSkill} -> ${learnSkill}`,
        ragResult.matches.length
      );

      return res.json({
        success: true,
        summary: ragResult.summary,
        matches: ragResult.matches,
        selectedIds: ragResult.selectedIds,
        retrievedCount: ragResult.retrievedCount,
        queryInfo: ragResult.queryInfo,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/admin/ai-overview", auth, adminOnly, async (_req, res, next) => {
    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [users, requests, activities, activeConversations] = await Promise.all([User.countDocuments(), SkillRequest.countDocuments(), AiActivity.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$type", count: { $sum: 1 }, results: { $sum: "$resultCount" } } }]), AiConversation.countDocuments({ lastActivityAt: { $gte: since } })]);
      const byType = Object.fromEntries(activities.map((item) => [item._id, item]));
      return res.json({ success: true, metrics: { users, requests, activeConversations, aiSearches: byType.SKILL_SEARCH?.count || 0, searchesWithMatches: byType.SKILL_SEARCH?.results || 0, chats: byType.CHAT?.count || 0 } });
    } catch (error) { return next(error); }
  });
}

export { SkillRequest, groq, parseJson };
