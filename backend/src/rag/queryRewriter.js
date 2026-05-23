import { chat } from '../llm/groq.js';
import { logger } from '../lib/logger.js';

const ENABLED = (process.env.RAG_USE_QUERY_REWRITE ?? 'true').toLowerCase() === 'true';

const SYSTEM = `You rewrite a user's latest message into a single self-contained search query for a knowledge base.

Rules:
- If the message is already self-contained, return it unchanged (do not paraphrase or shorten).
- If the message references the prior turns ("that", "they", "the second one", "what about it"), expand it using the history so it stands alone.
- Output ONLY the rewritten query as plain text. No explanation, no quotes, no labels.`;

/**
 * Rewrite the latest user message into a self-contained query when needed.
 * Falls back to the original message on any failure — accuracy nice-to-have,
 * never a blocker.
 *
 * @param {string} message — current user message
 * @param {Array<{role:string, content:string}>} history — prior conversation
 */
export async function rewriteQuery(message, history = []) {
  if (!ENABLED) return message;
  if (!history || history.length === 0) return message;

  const recent = history.slice(-6);
  const formatted = recent.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

  try {
    const out = await chat({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `History:\n${formatted}\n\nLatest message:\n${message}\n\nRewritten query:` },
      ],
      maxTokens: 120,
      temperature: 0.0,
    });
    const cleaned = out.replace(/^["']|["']$/g, '').replace(/^Rewritten query:\s*/i, '').trim();
    if (!cleaned || cleaned.length > 400) return message;
    return cleaned;
  } catch (err) {
    logger.warn('query rewrite failed (using original)', { error: err.message });
    return message;
  }
}
