import Groq from 'groq-sdk';
import { logger } from '../lib/logger.js';

let client = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY missing in backend/.env');
  client = new Groq({ apiKey });
  return client;
}

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

const isTransient = (err) => {
  const status = err.status ?? err.statusCode;
  if (status === 429 || status === 503 || status === 502) return true;
  return /ECONNRESET|ETIMEDOUT|fetch failed/i.test(String(err.message ?? err));
};

/**
 * Streaming chat completion. Returns an async iterable of text deltas.
 * Falls back to FALLBACK_MODEL on transient errors.
 */
export async function streamChat({ messages, model, temperature = 0.3, maxTokens = 1024 }) {
  const groq = getClient();
  const effectiveModel = model || PRIMARY_MODEL;

  async function attempt(useModel) {
    return groq.chat.completions.create({
      model: useModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
  }

  let stream;
  try {
    stream = await attempt(effectiveModel);
  } catch (err) {
    if (isTransient(err) && effectiveModel !== FALLBACK_MODEL) {
      logger.warn(`Groq primary failed, falling back to ${FALLBACK_MODEL}`, {
        error: err.message,
      });
      stream = await attempt(FALLBACK_MODEL);
    } else {
      throw err;
    }
  }

  return stream;
}

/**
 * Non-streaming completion. Used for query rewriting and reranking where we
 * want a single small JSON-ish answer.
 */
export async function chat({ messages, model, temperature = 0.0, maxTokens = 256 }) {
  const groq = getClient();
  const useModel = model || FALLBACK_MODEL;
  const resp = await groq.chat.completions.create({
    model: useModel,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  });
  return resp.choices?.[0]?.message?.content?.trim() ?? '';
}
