// A small, self-contained RAG (retrieval-augmented generation) engine.
//
// This is a real retrieval step, not a static/fake context block: every
// call to retrieve() tokenizes the query, builds a TF-IDF vector for it
// against the corpus vocabulary, and ranks knowledge-base chunks by
// cosine similarity — different submissions surface different chunks.
//
// No external embeddings API is configured for this project, so this uses
// classic (and legitimate) sparse-vector IR rather than dense embeddings.
// The index is built once at module load and reused for every request.

import { KNOWLEDGE_BASE } from "./knowledgeBase.js";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "for", "with", "as", "at", "by",
  "this", "that", "these", "those", "it", "its", "i", "you", "your", "my",
  "we", "our", "they", "their", "he", "she", "will", "can", "do", "does",
  "not", "no", "so", "if", "than", "then", "into", "about", "from", "up",
  "out", "also", "just", "very", "such",
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function termFrequencies(tokens) {
  const tf = new Map();
  for (const token of tokens) tf.set(token, (tf.get(token) || 0) + 1);
  return tf;
}

// --- Build the index once at module load -----------------------------------

const documents = KNOWLEDGE_BASE.map((chunk) => ({
  chunk,
  tokens: tokenize(chunk.text),
}));

const documentFrequency = new Map(); // term -> number of chunks containing it
for (const doc of documents) {
  const seen = new Set(doc.tokens);
  for (const term of seen) documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
}

const totalDocs = documents.length;
const idf = new Map();
for (const [term, df] of documentFrequency.entries()) {
  idf.set(term, Math.log((totalDocs + 1) / (df + 1)) + 1); // smoothed idf
}

function tfidfVector(tokens) {
  const tf = termFrequencies(tokens);
  const vector = new Map();
  for (const [term, count] of tf.entries()) {
    const weight = (count / tokens.length) * (idf.get(term) ?? Math.log(totalDocs + 1) + 1);
    if (weight > 0) vector.set(term, weight);
  }
  return vector;
}

const documentVectors = documents.map((doc) => ({
  chunk: doc.chunk,
  vector: tfidfVector(doc.tokens),
  norm: 0,
}));
for (const entry of documentVectors) {
  let sumSquares = 0;
  for (const weight of entry.vector.values()) sumSquares += weight * weight;
  entry.norm = Math.sqrt(sumSquares);
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
 * Retrieve the top-K knowledge base chunks most relevant to a query
 * (typically the submitted skill's title + description).
 */
export function retrieve(query, topK = 6) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const queryVector = tfidfVector(queryTokens);
  let queryNorm = 0;
  for (const weight of queryVector.values()) queryNorm += weight * weight;
  queryNorm = Math.sqrt(queryNorm);

  const scored = documentVectors.map((entry) => ({
    chunk: entry.chunk,
    score: cosineSimilarity(queryVector, queryNorm, entry.vector, entry.norm),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((item) => item.score > 0);
}

export function formatRetrievedContext(results) {
  if (!results.length) return "No closely related knowledge base entries were found.";
  return results
    .map(({ chunk, score }) => `[${chunk.id} | ${chunk.type}${chunk.category ? ` | ${chunk.category}` : ""} | relevance ${score.toFixed(3)}]\n${chunk.text}`)
    .join("\n\n");
}
