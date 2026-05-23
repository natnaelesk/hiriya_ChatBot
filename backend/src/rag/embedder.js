import { GoogleGenAI } from '@google/genai';
import { logger } from '../lib/logger.js';

let ai = null;

function client() {
  if (ai) return ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY missing in backend/.env');
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

const MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
const DIM = Number(process.env.GEMINI_EMBED_DIM || 768);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free tier rate limits are conservative; keep batches small and add backoff.
// gemini-embedding-001 accepts an array of `contents`; we cap at 100 per call.
const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 5;

async function embedBatch(texts, taskType) {
  let attempt = 0;
  while (true) {
    try {
      const resp = await client().models.embedContent({
        model: MODEL,
        contents: texts,
        config: {
          taskType,
          outputDimensionality: DIM,
        },
      });
      const vectors = (resp.embeddings ?? []).map((e) => e.values);
      if (vectors.length !== texts.length) {
        throw new Error(
          `Embedding count mismatch: requested ${texts.length}, got ${vectors.length}`,
        );
      }
      return vectors;
    } catch (err) {
      attempt += 1;
      const transient =
        err.status === 429 || err.status === 503 || /ECONNRESET|ETIMEDOUT|fetch failed/i.test(String(err));
      if (!transient || attempt >= MAX_ATTEMPTS) throw err;
      const backoff = Math.min(2000 * 2 ** (attempt - 1), 30_000) + Math.random() * 500;
      logger.warn(`embed retry ${attempt}/${MAX_ATTEMPTS} in ${Math.round(backoff)}ms`, {
        status: err.status,
        message: err.message,
      });
      await sleep(backoff);
    }
  }
}

/**
 * Embed an array of strings with the given Gemini task type.
 * Use `RETRIEVAL_DOCUMENT` when ingesting chunks, `RETRIEVAL_QUERY` when querying.
 */
export async function embed(texts, taskType = 'RETRIEVAL_DOCUMENT') {
  if (!Array.isArray(texts)) throw new TypeError('embed() expects an array of strings');
  if (texts.length === 0) return [];

  const out = new Array(texts.length);
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await embedBatch(batch, taskType);
    for (let j = 0; j < vectors.length; j += 1) out[i + j] = vectors[j];
  }
  return out;
}

export async function embedQuery(text) {
  const [v] = await embed([text], 'RETRIEVAL_QUERY');
  return v;
}

export const EMBEDDING_DIM = DIM;
