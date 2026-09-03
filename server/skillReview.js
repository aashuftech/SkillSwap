import { retrieve, formatRetrievedContext } from "./rag.js";
import { parseJson } from "./adminAiChat.js";
import { DEPARTMENTS, matchCategoryFromText } from "./departments.js";

// The skill-review pipeline always tries openai/gpt-oss-120b first, as
// specifically required for this feature. It falls back only on a
// missing/retired-model response (404) — auth, quota, and bad-request
// errors are surfaced directly rather than silently swallowed. This is
// intentionally independent of GROQ_MODEL/adminAiChat's model list, which
// power the separate AI chat/search features.
const SKILL_REVIEW_MODELS = [
  ...new Set([
    "openai/gpt-oss-120b",
    process.env.GROQ_MODEL,
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "qwen/qwen3.8-27b",
    "groq/compound-mini",
  ].filter(Boolean)),
];

async function groqSkillReview(messages) {
  if (!process.env.GROQ_API_KEY) throw new Error("AI review is not configured. Add GROQ_API_KEY to the server .env file.");
  let lastFailure = "";

  for (const selectedModel of SKILL_REVIEW_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          temperature: 0,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { content: data.choices?.[0]?.message?.content || "", modelUsed: selectedModel };
      }

      const details = await response.text();
      lastFailure = `Groq model ${selectedModel} failed (${response.status}): ${details.slice(0, 300)}`;
      if (response.status === 401) throw new Error("Invalid GROQ_API_KEY provided.");
    } catch (err) {
      if (err.message === "Invalid GROQ_API_KEY provided.") throw err;
      lastFailure = err.message || lastFailure;
    }
  }

  throw new Error(lastFailure || "No configured Groq model is available for this API key.");
}

/**
 * Runs the full RAG -> Groq skill review pipeline for a submitted skill.
 * Returns { recommendation, category, reason, confidence, retrievedChunkIds, model }.
 * This NEVER decides the final published status — admins always make the
 * final approve/reject call (see server/admin.js).
 */
export async function reviewSkillSubmission({ title, description, learnSkill }) {
  const query = `${title}. ${description}`;
  const retrieved = retrieve(query, 6);
  const context = formatRetrievedContext(retrieved);

  const systemPrompt = [
    "You are the SkillSwap moderation assistant. You review a member's submitted TEACHABLE skill and recommend approve or reject, plus which department it belongs to.",
    `Valid departments (use exactly one of these strings, case-sensitive): ${DEPARTMENTS.join(", ")}.`,
    "Classify strictly by the skill being TAUGHT/OFFERED, never by the skill the member wants to learn in return — that field is context only.",
    "Use the retrieved knowledge base context below as your policy reference for what counts as valid, what counts as spam/invalid, and how to classify.",
    "Return ONLY a JSON object with exactly these fields: recommendation (\"approve\" or \"reject\"), category (one of the valid departments above), reason (one or two concise sentences explaining the decision), confidence (a number from 0 to 1).",
    "You only RECOMMEND — a human admin makes the final publish decision, so lean toward \"approve\" for genuine, specific, teachable skills and \"reject\" only for clear spam, illegal content, hate, disallowed professional-advice claims, or unteachable/vague submissions.",
    "\n--- RETRIEVED KNOWLEDGE BASE CONTEXT ---\n" + context,
  ].join("\n");

  const { content, modelUsed } = await groqSkillReview([
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify({ teachSkill: title, description, learnSkill: learnSkill || "" }) },
  ]);

  const parsed = parseJson(content);
  const recommendation = parsed.recommendation === "reject" ? "reject" : parsed.recommendation === "approve" ? "approve" : null;
  const ruleCategory = matchCategoryFromText(title, description);
  const category = (ruleCategory && ruleCategory !== "Others")
    ? ruleCategory
    : (DEPARTMENTS.includes(parsed.category) ? parsed.category : ruleCategory || "Others");
  const confidence = Number.isFinite(Number(parsed.confidence)) ? Math.min(1, Math.max(0, Number(parsed.confidence))) : 0.5;
  const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim().slice(0, 1000) : "No reason provided by the model.";

  if (!recommendation) throw new Error("AI review returned an invalid recommendation.");

  return {
    recommendation,
    category,
    reason,
    confidence,
    retrievedChunkIds: retrieved.map((item) => item.chunk.id),
    model: modelUsed,
  };
}
