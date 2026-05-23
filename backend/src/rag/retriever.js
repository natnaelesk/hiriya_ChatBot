import { getDb } from '../db/client.js';
import { embedQuery } from './embedder.js';
import { logger } from '../lib/logger.js';

const DEFAULT_K = Number(process.env.RAG_TOP_K ?? 5);
const DEFAULT_CANDIDATES = Number(process.env.RAG_CANDIDATES ?? 20);
const DEFAULT_THRESHOLD = Number(process.env.RAG_SCORE_THRESHOLD ?? 0.0);
const USE_HYBRID = (process.env.RAG_USE_HYBRID ?? 'true').toLowerCase() === 'true';

/**
 * Reciprocal Rank Fusion: combine multiple ranked lists into one stable ranking.
 * Standard k=60 constant.
 */
export function reciprocalRankFusion(listsByKey, k = 60) {
  const scores = new Map();
  const items = new Map();
  for (const list of listsByKey) {
    list.forEach((item, rank) => {
      const id = item.id;
      const incr = 1 / (k + rank + 1);
      scores.set(id, (scores.get(id) || 0) + incr);
      if (!items.has(id)) items.set(id, item);
    });
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ ...items.get(id), score }));
}

async function vectorSearch(query, candidates, threshold) {
  const queryEmbedding = await embedQuery(query);
  const db = getDb();
  const { data, error } = await db.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: candidates,
    min_score: threshold,
  });
  if (error) {
    logger.error('vector search failed', { error: error.message });
    throw new Error(`vector search: ${error.message}`);
  }
  return data ?? [];
}

async function ftsSearch(query, candidates) {
  const db = getDb();
  const { data, error } = await db.rpc('match_chunks_fts', {
    query_text: query,
    match_count: candidates,
  });
  if (error) {
    logger.warn('fts search failed (non-fatal)', { error: error.message });
    return [];
  }
  return data ?? [];
}

async function attachDocumentTitles(rows) {
  if (rows.length === 0) return rows;
  const ids = [...new Set(rows.map((r) => r.document_id).filter(Boolean))];
  if (ids.length === 0) return rows;

  const db = getDb();
  const { data, error } = await db
    .from('documents')
    .select('id, title, source, metadata')
    .in('id', ids);
  if (error) {
    logger.warn('failed to attach document titles', { error: error.message });
    return rows;
  }
  const byId = new Map((data ?? []).map((d) => [d.id, d]));
  return rows.map((r) => ({
    ...r,
    document: byId.get(r.document_id) ?? null,
  }));
}

/**
 * Retrieve top-k chunks for a query.
 *
 * Pipeline:
 *   1. Vector search (top {candidates}).
 *   2. Optionally full-text search (top {candidates}).
 *   3. Reciprocal Rank Fusion if hybrid.
 *   4. Trim to {topK}.
 *   5. Hydrate with parent document title/source.
 */
export async function retrieve(query, opts = {}) {
  const topK = opts.topK ?? DEFAULT_K;
  const candidates = opts.candidates ?? DEFAULT_CANDIDATES;
  const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
  const hybrid = opts.hybrid ?? USE_HYBRID;

  const t0 = Date.now();
  const vectorHits = await vectorSearch(query, candidates, threshold);
  let merged = vectorHits;

  if (hybrid) {
    const ftsHits = await ftsSearch(query, candidates);
    if (ftsHits.length > 0) {
      merged = reciprocalRankFusion([vectorHits, ftsHits]);
    }
  }

  const trimmed = merged.slice(0, topK);
  const enriched = await attachDocumentTitles(trimmed);

  logger.debug('retrieve done', {
    query,
    vectorHits: vectorHits.length,
    hybrid,
    returned: enriched.length,
    ms: Date.now() - t0,
  });

  return enriched;
}
