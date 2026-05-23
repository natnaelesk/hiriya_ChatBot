#!/usr/bin/env node
import '../env-bootstrap.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { getDb } from '../src/db/client.js';
import { embed } from '../src/rag/embedder.js';
import { chunkText } from '../src/rag/chunker.js';
import { logger } from '../src/lib/logger.js';

import { parseFile, SUPPORTED_EXTENSIONS } from './lib/parsers.js';
import { walk } from './lib/walk.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

async function ingestFile(absPath, db) {
  const rel = path.relative(DATA_DIR, absPath);
  const parsed = await parseFile(absPath);
  if (!parsed || !parsed.text) {
    logger.warn(`skip (empty/unsupported): ${rel}`);
    return { skipped: 1 };
  }

  const contentHash = sha256(parsed.text);

  const { data: existing, error: findErr } = await db
    .from('documents')
    .select('id, content_hash')
    .eq('content_hash', contentHash)
    .maybeSingle();
  if (findErr) throw new Error(`lookup failed for ${rel}: ${findErr.message}`);
  if (existing) {
    logger.info(`unchanged: ${rel}`);
    return { unchanged: 1 };
  }

  // Replace any prior version of this source path.
  await db.from('documents').delete().eq('source', rel);

  const { data: insertedDoc, error: insErr } = await db
    .from('documents')
    .insert({
      source: rel,
      title: parsed.title,
      content_hash: contentHash,
      metadata: parsed.metadata ?? {},
    })
    .select('id')
    .single();
  if (insErr) throw new Error(`insert document failed for ${rel}: ${insErr.message}`);
  const docId = insertedDoc.id;

  const chunks = chunkText(parsed.text);
  if (chunks.length === 0) {
    logger.warn(`no chunks produced: ${rel}`);
    return { empty: 1 };
  }

  logger.info(`embedding ${chunks.length} chunk(s): ${rel}`);
  const vectors = await embed(
    chunks.map((c) => c.content),
    'RETRIEVAL_DOCUMENT',
  );

  const rows = chunks.map((c, idx) => ({
    document_id: docId,
    chunk_index: idx,
    content: c.content,
    embedding: vectors[idx],
    metadata: { heading: c.heading ?? null, title: parsed.title, source: rel },
  }));

  // Insert in batches to stay under Postgres parameter limits.
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error: chunkErr } = await db.from('chunks').insert(batch);
    if (chunkErr) throw new Error(`insert chunks failed for ${rel}: ${chunkErr.message}`);
  }
  logger.info(`ingested: ${rel} (${chunks.length} chunks)`);
  return { ingested: 1, chunks: chunks.length };
}

async function main() {
  const db = getDb();
  const probe = await db.from('documents').select('id').limit(1);
  if (probe.error) {
    logger.error('DB probe failed — run SQL migrations in Supabase (see backend/src/db/migrations/)', {
      message: probe.error.message,
    });
    process.exit(1);
  }
  const files = await walk(DATA_DIR, (full) => {
    if (path.basename(full).toLowerCase() === 'readme.md') return false;
    return SUPPORTED_EXTENSIONS.includes(path.extname(full).toLowerCase());
  });

  if (files.length === 0) {
    console.log(`No documents found in ${DATA_DIR}.`);
    console.log(`Drop ${SUPPORTED_EXTENSIONS.join(', ')} files there and re-run.`);
    return;
  }

  logger.info(`found ${files.length} document(s) under ${DATA_DIR}`);

  const totals = { ingested: 0, unchanged: 0, skipped: 0, empty: 0, chunks: 0, errors: 0 };
  for (const f of files) {
    try {
      const r = await ingestFile(f, db);
      for (const key of Object.keys(r)) totals[key] = (totals[key] || 0) + r[key];
    } catch (err) {
      totals.errors += 1;
      logger.error(`failed: ${path.relative(DATA_DIR, f)}`, { error: err.message });
    }
  }

  console.log('\nIngestion summary:');
  for (const [k, v] of Object.entries(totals)) console.log(`  ${k}: ${v}`);
}

main().catch((err) => {
  logger.error('fatal', { error: err.message, stack: err.stack });
  process.exit(1);
});
