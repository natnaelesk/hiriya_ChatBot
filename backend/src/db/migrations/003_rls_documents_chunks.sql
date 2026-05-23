-- Tables `documents` and `chunks` are written only by the Node backend using the
-- **service_role** key. If RLS is left ON with no policy (Supabase default on new
-- tables), inserts fail with:
--   "new row violates row-level security policy for table \"documents\""
--
-- For this architecture, disable RLS on these two tables. (Your API keys never
-- ship to the browser; security is at the Express layer.)
--
-- If you prefer RLS ON instead, remove this file and use the real **service_role**
-- JWT from Supabase → Settings → API (long `eyJ...` secret), not the anon key.

alter table if exists documents disable row level security;
alter table if exists chunks disable row level security;
