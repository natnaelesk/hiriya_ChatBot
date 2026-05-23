#!/usr/bin/env node
// Convenience helper: prints the migration SQL files in order so you can paste
// them into the Supabase SQL editor (which is the recommended way for Supabase).
//
// We deliberately do NOT execute SQL via the JS client — Supabase requires the
// `service_role` key and an exposed RPC for arbitrary DDL, which most teams
// (correctly) lock down. Copy/paste keeps things explicit.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(__dirname, '..', 'src', 'db', 'migrations');

const files = (await readdir(MIG_DIR)).filter((f) => f.endsWith('.sql')).sort();
for (const f of files) {
  const sql = await readFile(path.join(MIG_DIR, f), 'utf8');
  console.log(`\n-- =========================================`);
  console.log(`-- ${f}`);
  console.log(`-- =========================================\n`);
  console.log(sql);
}
console.log('\n-- Copy the above into the Supabase SQL editor and run.');
