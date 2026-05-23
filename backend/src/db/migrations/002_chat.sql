-- Chat persistence. Run after 001_init.sql.

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

-- Bump chats.updated_at whenever a message is added so the sidebar can sort by recency.
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
