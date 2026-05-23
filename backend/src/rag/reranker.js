import { chat } from '../llm/groq.js';
import { logger } from '../lib/logger.js';

const ENABLED = (process.env.RAG_USE_RERANKER ?? 'true').toLowerCase() === 'true';
const MAX_CHUNK_CHARS = 700; // keep prompt small

const SYSTEM = `You are a relevance grader for a retrieval system.

Given a USER QUERY and a numbered list of CANDIDATE PASSAGES, output ONE JSON line:
{"scores":[<int 0-10>, ...]}

Rules:
- Output exactly one number per candidate, in the same order, on a 0-10 scale where 10 means the passage directly answers the query and 0 means irrelevant.
- Output JSON only, no commentary, no markdown fences.`;

function buildPrompt(query, candidates) {
  const lines = candidates.map((c, i) => {
    const txt = String(c.content ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHUNK_CHARS);
    return `[${i + 1}] ${txt}`;
  });
  return `USER QUERY:\n${query}\n\nCANDIDATE PASSAGES:\n${lines.join('\n\n')}`;
}

function parseScores(raw, expected) {
  if (!raw) return null;
  // Find the first JSON object that looks plausible.
  const m = raw.match(/\{[^]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]);
    if (!Array.isArray(obj.scores)) return null;
    const out = obj.scores.slice(0, expected).map((n) => {
      const x = Number(n);
      if (!Number.isFinite(x)) return 0;
      return Math.max(0, Math.min(10, x));
    });
    while (out.length < expected) out.push(0);
    return out;
  } catch {
    return null;
  }
}

/**
 * Re-rank candidate chunks against the query using a small LLM.
 * Falls back to the input order on any failure.
 */
export async function rerank(query, candidates, { topN = 5 } = {}) {
  if (!ENABLED || !Array.isArray(candidates) || candidates.length <= 1) {
    return candidates.slice(0, topN);
  }

  try {
    const out = await chat({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildPrompt(query, candidates) },
      ],
      maxTokens: 200,
      temperature: 0.0,
    });
    const scores = parseScores(out, candidates.length);
    if (!scores) {
      logger.debug('reranker output unparsable, keeping original order');
      return candidates.slice(0, topN);
    }
    const ranked = candidates
      .map((c, i) => ({ ...c, rerankScore: scores[i] }))
      .sort((a, b) => b.rerankScore - a.rerankScore)
      .slice(0, topN);
    logger.debug('rerank done', {
      kept: ranked.length,
      topScore: ranked[0]?.rerankScore ?? 0,
    });
    return ranked;
  } catch (err) {
    logger.warn('reranker failed (keeping original order)', { error: err.message });
    return candidates.slice(0, topN);
  }
}
