-- =============================================================================
-- Hiriya: run this entire file once in the Supabase SQL Editor (Dashboard → SQL).
-- Idempotent: safe to re-run. After success, wait ~30s or click "Reload schema"
-- if PostgREST still caches an old state.
-- =============================================================================

-- === 001_init.sql ===
create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists documents (
  id            uuid        primary key default gen_random_uuid(),
  source        text        not null,
  title         text,
  content_hash  text        unique not null,
  metadata      jsonb       not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists chunks (
  id           uuid         primary key default gen_random_uuid(),
  document_id  uuid         references documents(id) on delete cascade,
  chunk_index  int          not null,
  content      text         not null,
  embedding    vector(768),
  metadata     jsonb        not null default '{}'::jsonb,
  created_at   timestamptz  not null default now()
);

create index if not exists chunks_document_idx
  on chunks (document_id, chunk_index);

create index if not exists chunks_embedding_idx
  on chunks using hnsw (embedding vector_cosine_ops);

create index if not exists chunks_content_fts_idx
  on chunks using gin (to_tsvector('english', content));

create or replace function match_chunks(
  query_embedding vector(768),
  match_count     int    default 5,
  min_score       float  default 0.0
)
returns table (
  id          uuid,
  document_id uuid,
  chunk_index int,
  content     text,
  metadata    jsonb,
  score       float
)
language sql stable as $$
  select c.id,
         c.document_id,
         c.chunk_index,
         c.content,
         c.metadata,
         1 - (c.embedding <=> query_embedding) as score
  from chunks c
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_score
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function match_chunks_fts(
  query_text  text,
  match_count int  default 20
)
returns table (
  id          uuid,
  document_id uuid,
  chunk_index int,
  content     text,
  metadata    jsonb,
  score       float
)
language sql stable as $$
  with q as (
    select websearch_to_tsquery('english', query_text) as tsq
  )
  select c.id,
         c.document_id,
         c.chunk_index,
         c.content,
         c.metadata,
         ts_rank_cd(to_tsvector('english', c.content), (select tsq from q))::float as score
  from chunks c, q
  where to_tsvector('english', c.content) @@ q.tsq
  order by score desc
  limit match_count;
$$;

-- === 002_chat.sql ===
create table if not exists chats (
  id          uuid        primary key default gen_random_uuid(),
  user_id     text        not null,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists messages (
  id          uuid        primary key default gen_random_uuid(),
  chat_id     uuid        not null references chats(id) on delete cascade,
  role        text        not null check (role in ('user', 'assistant', 'system')),
  content     text        not null,
  sources     jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists messages_chat_idx on messages (chat_id, created_at);
create index if not exists chats_user_idx    on chats    (user_id, updated_at desc);

create or replace function bump_chat_updated_at()
returns trigger language plpgsql as $$
begin
  update chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_chat on messages;
create trigger messages_bump_chat
  after insert on messages
  for each row execute function bump_chat_updated_at();

-- === 003_rls_documents_chunks.sql ===
-- Backend-only tables: disable RLS so inserts from the ingest script succeed.
-- Prefer fixing SUPABASE_SERVICE_ROLE_KEY to the real service_role JWT if you
-- want RLS enabled with policies instead.
alter table if exists documents disable row level security;
alter table if exists chunks disable row level security;
