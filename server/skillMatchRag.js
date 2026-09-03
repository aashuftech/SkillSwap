import Skill from "./models/Skill.js";
import User from "./models/User.js";
import { groq, parseJson } from "./adminAiChat.js";
import { CATEGORY_RULES, DEPARTMENTS } from "./departments.js";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "for", "with", "as", "at", "by",
  "this", "that", "these", "those", "it", "its", "i", "you", "your", "my",
  "me", "we", "our", "they", "their", "he", "she", "will", "can", "do", "does",
  "not", "no", "so", "if", "than", "then", "into", "about", "from", "up",
  "out", "also", "just", "very", "such", "want", "wants", "looking", "look",
  "teach", "teaches", "teaching", "learn", "learns", "learning", "know", "knows",
  "skill", "skills", "swap", "swaps", "someone", "anyone", "need", "needs",
  "please", "help", "like", "good", "best", "experience",
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function termFrequencies(tokens) {
  const tf = new Map();
  for (const token of tokens) tf.set(token, (tf.get(token) || 0) + 1);
  return tf;
}

function cosineSimilarity(vecA, normA, vecB, normB) {
  if (normA === 0 || normB === 0) return 0;
  const [smaller, larger] = vecA.size < vecB.size ? [vecA, vecB] : [vecB, vecA];
  let dot = 0;
  for (const [term, weight] of smaller.entries()) {
    const other = larger.get(term);
    if (other) dot += weight * other;
  }
  return dot / (normA * normB);
}

/**
 * Extract teach and learn targets from natural language queries
 * e.g., "I teach React and want to learn Graphic Design"
 */
export function parseIntentFromPrompt(rawPrompt) {
  const prompt = String(rawPrompt || "").trim();
  let teachTarget = "";
  let learnTarget = "";

  // Pattern 1: "I teach X and want to learn Y" / "I can teach X, looking for Y"
  const teachFirstMatch = prompt.match(
    /(?:i\s+(?:can\s+)?teach|teaching|offering|offer|i\s+know)\s+([^,.;]+?)(?:\s+(?:and\s+)?(?:want\s+to\s+learn|looking\s+for|need|want|seeking)|\s*,\s*(?:want\s+to\s+learn|looking\s+for|need|want|seeking))\s+([^,.;]+)/i
  );

  // Pattern 2: "I want to learn Y and can teach X" / "Looking for Y, I can teach X"
  const learnFirstMatch = prompt.match(
    /(?:i\s+want\s+to\s+learn|looking\s+for|want|need|seeking|learn)\s+([^,.;]+?)(?:\s+(?:and\s+)?(?:i\s+can\s+teach|i\s+teach|offering|offer|can\s+offer)|\s*,\s*(?:i\s+can\s+teach|i\s+teach|offering|offer|can\s+offer))\s+([^,.;]+)/i
  );

  if (teachFirstMatch) {
    teachTarget = teachFirstMatch[1].trim();
    learnTarget = teachFirstMatch[2].trim();
  } else if (learnFirstMatch) {
    learnTarget = learnFirstMatch[1].trim();
    teachTarget = learnFirstMatch[2].trim();
  } else {
    // If no explicit split, check if starts with "teach" or "learn"
    const learnOnlyMatch = prompt.match(/(?:want\s+to\s+learn|looking\s+for|need|learn)\s+([^,.;]+)/i);
    const teachOnlyMatch = prompt.match(/(?:can\s+teach|teach|offering)\s+([^,.;]+)/i);

    if (learnOnlyMatch) learnTarget = learnOnlyMatch[1].trim();
    if (teachOnlyMatch) teachTarget = teachOnlyMatch[1].trim();

    // Fallback: entire prompt is what user wants to find / learn
    if (!learnTarget && !teachTarget) {
      learnTarget = prompt;
    }
  }

  return { teachTarget, learnTarget, rawQuery: prompt };
}

/**
 * Retrieve relevant approved database candidates using sparse-vector TF-IDF RAG retrieval.
 */
export async function retrieveSkillSwapCandidates({ teachTarget, learnTarget, rawQuery }, topK = 10) {
  // Query only real approved skills from the database
  const approvedSkills = await Skill.find({ status: "approved" })
    .populate("user", "name email location avatar bio headline skillsToTeach skillsToLearn rating ratingCount")
    .sort({ createdAt: -1 })
    .lean();

  if (!approvedSkills || approvedSkills.length === 0) {
    return [];
  }

  // Build candidate records
  const candidates = approvedSkills.map((skill) => {
    const userObj = skill.user && typeof skill.user === "object" ? skill.user : null;
    const ratingCount = userObj?.ratingCount ? Number(userObj.ratingCount) : 0;
    const rating = ratingCount > 0 && userObj?.rating ? Number(userObj.rating) : null;

    const teachSkillText = `${skill.title} ${skill.category} ${skill.description || ""}`.trim();
    const learnSkillText = `${skill.learnSkill || ""} ${userObj?.skillsToLearn || ""}`.trim();
    const fullText = `${teachSkillText} ${learnSkillText} ${userObj?.bio || ""}`.trim();

    return {
      id: skill._id.toString(),
      skillTitle: skill.title,
      description: skill.description || "",
      category: skill.category || "Others",
      learnSkill: skill.learnSkill || userObj?.skillsToLearn || "Any useful skill",
      userName: userObj?.name || skill.userName || "Community Member",
      userAvatar: userObj?.avatar || "",
      userLocation: userObj?.location || "Remote / Online",
      userRating: rating,
      userRatingCount: ratingCount,
      teachSkillText,
      learnSkillText,
      fullText,
      teachTokens: tokenize(teachSkillText),
      learnTokens: tokenize(learnSkillText),
      fullTokens: tokenize(fullText),
    };
  });

  // Calculate IDF across the database corpus
  const totalDocs = candidates.length;
  const dfMap = new Map();
  for (const cand of candidates) {
    const uniqueTerms = new Set(cand.fullTokens);
    for (const term of uniqueTerms) {
      dfMap.set(term, (dfMap.get(term) || 0) + 1);
    }
  }

  const idfMap = new Map();
  for (const [term, df] of dfMap.entries()) {
    idfMap.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1);
  }

  function getVector(tokens) {
    const tf = termFrequencies(tokens);
    const vec = new Map();
    let sumSq = 0;
    for (const [term, count] of tf.entries()) {
      const weight = (count / (tokens.length || 1)) * (idfMap.get(term) || Math.log(totalDocs + 1) + 1);
      if (weight > 0) {
        vec.set(term, weight);
        sumSq += weight * weight;
      }
    }
    return { vector: vec, norm: Math.sqrt(sumSq) };
  }

  // Precompute candidate vectors
  const candidateVectors = candidates.map((cand) => ({
    candidate: cand,
    teachVec: getVector(cand.teachTokens),
    learnVec: getVector(cand.learnTokens),
    fullVec: getVector(cand.fullTokens),
  }));

  // Tokenize queries
  const learnQueryTokens = tokenize(learnTarget || rawQuery);
  const teachQueryTokens = tokenize(teachTarget);
  const rawQueryTokens = tokenize(rawQuery);

  const learnQueryVec = getVector(learnQueryTokens);
  const teachQueryVec = getVector(teachQueryTokens);
  const rawQueryVec = getVector(rawQueryTokens);

  // Score each candidate
  const scored = candidateVectors.map(({ candidate, teachVec, learnVec, fullVec }) => {
    // 1. How well what candidate TEACHES matches what user wants to LEARN (Primary)
    const teachToLearnSim = cosineSimilarity(
      learnQueryVec.vector,
      learnQueryVec.norm,
      teachVec.vector,
      teachVec.norm
    );

    // 2. How well what candidate WANTS TO LEARN matches what user TEACHES (Mutual swap boost!)
    let mutualSwapSim = 0;
    if (teachQueryTokens.length > 0) {
      mutualSwapSim = cosineSimilarity(
        teachQueryVec.vector,
        teachQueryVec.norm,
        learnVec.vector,
        learnVec.norm
      );
    }

    // 3. Fallback / Overall semantic match
    const overallSim = cosineSimilarity(
      rawQueryVec.vector,
      rawQueryVec.norm,
      fullVec.vector,
      fullVec.norm
    );

    // Keyword exact containment bonuses
    let keywordBonus = 0;
    const candTeachLower = candidate.teachSkillText.toLowerCase();
    for (const token of learnQueryTokens) {
      if (candTeachLower.includes(token)) keywordBonus += 0.25;
    }
    if (teachQueryTokens.length > 0) {
      const candLearnLower = candidate.learnSkillText.toLowerCase();
      for (const token of teachQueryTokens) {
        if (candLearnLower.includes(token)) keywordBonus += 0.35; // Significant bonus for mutual match!
      }
    }

    // Composite score
    const compositeScore =
      teachToLearnSim * 2.0 + mutualSwapSim * 1.8 + overallSim * 0.8 + keywordBonus;

    return {
      candidate,
      score: compositeScore,
      teachToLearnSim,
      mutualSwapSim,
      isMutual: mutualSwapSim > 0.1 || (teachQueryTokens.length > 0 && keywordBonus >= 0.35),
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return Top-K most relevant database records
  return scored.slice(0, topK).map((item) => ({
    ...item.candidate,
    retrievalScore: Number(item.score.toFixed(3)),
    isMutual: item.isMutual,
  }));
}

/**
 * Send grounded database context to Groq LLM (openai/gpt-oss-120b) to compute match scores and explanations.
 */
export async function analyzeSkillMatchesWithLLM(retrievedCandidates, queryInfo) {
  const { teachTarget, learnTarget, rawQuery } = queryInfo;

  if (!retrievedCandidates || retrievedCandidates.length === 0) {
    return {
      summary: "No approved skills currently match this request.",
      matches: [],
    };
  }

  // Format concise grounded database candidate context for LLM
  const contextList = retrievedCandidates.map((c, index) => ({
    index: index + 1,
    id: c.id,
    teacherName: c.userName,
    skillTaught: c.skillTitle,
    category: c.category,
    description: c.description,
    wantsToLearn: c.learnSkill,
    location: c.userLocation,
    rating: c.userRating ? `${c.userRating} ★ (${c.userRatingCount} reviews)` : "New member",
  }));

  const systemPrompt = `You are the AI Matchmaker for SkillSwap, a peer-to-peer skill learning and exchange platform.
Your task is to analyze real candidate skill listings retrieved from our database and calculate swap compatibility scores for the user.

STRICT GROUNDING RULES:
1. ONLY evaluate the candidates provided in the RETRIEVED_CANDIDATES list. NEVER invent users, skills, or IDs.
2. For each candidate:
   - Check if what they TEACH matches what the user WANTS TO LEARN.
   - Check if what they WANT TO LEARN matches what the user CAN TEACH (Bonus for perfect 2-way mutual swap!).
   - Calculate matchScore (0 to 100):
     * 90-100: Exceptional 2-way mutual swap (They teach what you want AND want what you teach).
     * 75-89: High match (Strong skill alignment on what you want to learn).
     * 55-74: Good related / complementary skill match.
     * Below 50: Low relevance.
   - Write a concise, natural 1-sentence reason explaining the exact synergy (e.g., "Teaches UI/UX Design and wants to learn React — perfect 2-way skill swap!").
3. Return ONLY a valid JSON object matching this schema:
{
  "summary": "1 friendly sentence summarizing the top matches found.",
  "matches": [
    {
      "id": "exact candidate id from RETRIEVED_CANDIDATES",
      "matchScore": 95,
      "reason": "Teaches Graphic Design & Branding and wants React — perfect mutual skill swap!"
    }
  ]
}`;

  const userPrompt = `USER REQUEST:
- User Teaches: ${teachTarget || "Open to offer any useful skill"}
- User Wants to Learn: ${learnTarget || rawQuery}
- Full Context: ${rawQuery}

RETRIEVED_CANDIDATES FROM DATABASE (${contextList.length} items):
${JSON.stringify(contextList, null, 2)}`;

  try {
    const content = await groq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.15,
        response_format: { type: "json_object" },
      }
    );

    const parsed = parseJson(content);
    const validCandidateMap = new Map(retrievedCandidates.map((c) => [c.id, c]));

    const analyzedMatches = [];
    if (Array.isArray(parsed.matches)) {
      for (const m of parsed.matches) {
        const candidate = validCandidateMap.get(String(m.id));
        if (candidate) {
          const score = Math.min(100, Math.max(30, Number(m.matchScore) || 75));
          analyzedMatches.push({
            id: candidate.id,
            name: candidate.skillTitle,
            user: candidate.userName,
            offer: candidate.learnSkill,
            img: candidate.userAvatar,
            category: candidate.category,
            desc: candidate.description,
            location: candidate.userLocation,
            rating: candidate.userRating,
            ratingCount: candidate.userRatingCount,
            matchScore: score,
            reason: String(m.reason || "").trim() || `Teaches ${candidate.skillTitle} and wants ${candidate.learnSkill}.`,
            isMutualSwap: score >= 88 || candidate.isMutual,
          });
        }
      }
    }

    // Sort by matchScore descending
    analyzedMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      summary: parsed.summary || `Found ${analyzedMatches.length} matching skill swaps for you.`,
      matches: analyzedMatches,
      selectedIds: analyzedMatches.map((m) => m.id),
    };
  } catch (err) {
    console.warn("Groq LLM analysis fallback:", err.message);

    // Deterministic Fallback using RAG retrieval metrics
    const fallbackMatches = retrievedCandidates.map((c) => {
      const isMutual = c.isMutual;
      const baseScore = isMutual ? 92 : 78;
      const score = Math.min(99, Math.max(50, Math.round(baseScore + c.retrievalScore * 10)));
      const reason = isMutual
        ? `Teaches ${c.skillTitle} and wants to learn ${c.learnSkill} — great mutual match for your skills!`
        : `Offers expertise in ${c.skillTitle} (${c.category}) and is open to swap for ${c.learnSkill}.`;

      return {
        id: c.id,
        name: c.skillTitle,
        user: c.userName,
        offer: c.learnSkill,
        img: c.userAvatar,
        category: c.category,
        desc: c.description,
        location: c.userLocation,
        rating: c.userRating,
        ratingCount: c.userRatingCount,
        matchScore: score,
        reason,
        isMutualSwap: isMutual,
      };
    });

    fallbackMatches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      summary: `Found ${fallbackMatches.length} skill swap matches from the database.`,
      matches: fallbackMatches,
      selectedIds: fallbackMatches.map((m) => m.id),
    };
  }
}

/**
 * Full RAG-based AI Skill Matching pipeline
 */
export async function performRagSkillMatch({ prompt, teachSkill, learnSkill }) {
  // Step 1: Parse user search intent
  let intent;
  if (teachSkill?.trim() || learnSkill?.trim()) {
    intent = {
      teachTarget: String(teachSkill || "").trim(),
      learnTarget: String(learnSkill || "").trim(),
      rawQuery: `${teachSkill ? `Teaches: ${teachSkill}. ` : ""}${learnSkill ? `Wants to learn: ${learnSkill}` : ""}`.trim() || prompt,
    };
  } else {
    intent = parseIntentFromPrompt(prompt);
  }

  // Step 2: Information Retrieval from MongoDB Database
  const retrievedCandidates = await retrieveSkillSwapCandidates(intent, 10);

  // Step 3: LLM Evaluation & Compatibility Scoring via Groq openai/gpt-oss-120b
  const result = await analyzeSkillMatchesWithLLM(retrievedCandidates, intent);

  return {
    ...result,
    queryInfo: intent,
    retrievedCount: retrievedCandidates.length,
  };
}
