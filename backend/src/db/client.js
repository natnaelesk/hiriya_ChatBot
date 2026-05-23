import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { logger } from '../lib/logger.js';

let client = null;

export function getDb() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env',
    );
  }

  // Publishable keys (sb_publishable_*) are anon-equivalent and respect RLS — inserts will fail.
  // Backend must use a secret key (sb_secret_*) or the legacy service_role JWT (eyJ...).
  if (key.startsWith('sb_publishable_')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is a publishable key (sb_publishable_...). That key cannot bypass RLS. ' +
        'In Supabase Dashboard → Project Settings → API, copy a Secret API key (sb_secret_...) or the legacy service_role JWT, ' +
        'and set it as SUPABASE_SERVICE_ROLE_KEY in backend/.env.',
    );
  }

  // Node.js < 22 has no global WebSocket; @supabase/realtime-js needs one even
  // when we only use REST. See: https://github.com/supabase/supabase-js/issues
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
  logger.debug('Supabase client initialised');
  return client;
}

// Cheap probe used by /api/health. Use a real GET (not head:true) — PostgREST
// can return 204 on HEAD even when the table is missing, which masked errors.
export async function pingDb() {
  try {
    const db = getDb();
    const { error } = await db.from('documents').select('id').limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
