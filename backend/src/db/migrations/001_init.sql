-- Hiriya RAG schema. Run this once in the Supabase SQL editor.
-- Idempotent: safe to re-run.

create extension if not exists vector;
create extension if not exists pgcrypto;  -- gen_random_uuid()

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

-- Vector cosine top-K with optional score threshold.
-- Returns rows ordered by similarity desc (1 - cosine_distance).
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

-- BM25-ish full-text top-K via Postgres tsvector ranking.
-- Score is normalized to roughly 0..1 for fusion with vector scores.
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
