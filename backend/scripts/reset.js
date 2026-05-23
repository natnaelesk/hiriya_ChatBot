#!/usr/bin/env node
import '../env-bootstrap.mjs';
import { getDb } from '../src/db/client.js';
import { logger } from '../src/lib/logger.js';

async function main() {
  const db = getDb();
  // chunks cascades from documents
  const { error: docErr } = await db.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (docErr) {
    logger.error('reset failed', { error: docErr.message });
    process.exit(1);
  }
  console.log('Cleared documents and chunks.');
}

main();
