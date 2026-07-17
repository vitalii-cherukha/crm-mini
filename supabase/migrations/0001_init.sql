-- ============================================================================
-- Міні-CRM: список клієнтів з AI-нотатками
-- Ініціалізаційна міграція: таблиці clients, notes + Row Level Security.
--
-- Запуск: Supabase Dashboard -> SQL Editor -> вставити весь файл -> Run.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Таблиця clients
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  phone      text,
  email      text,
  status     text not null default 'new'
             check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

comment on table public.clients is 'Клієнти CRM.';
comment on column public.clients.status is 'new | in_progress | closed';

create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_status_idx on public.clients (status);

-- ----------------------------------------------------------------------------
-- Таблиця notes
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  text         text not null,
  ai_summary   text,
  ai_tags      text[],
  ai_sentiment text
               check (ai_sentiment is null or ai_sentiment in ('positive', 'neutral', 'negative')),
  created_at   timestamptz not null default now()
);

comment on table public.notes is 'Нотатки клієнтів разом з результатом AI-аналізу.';
comment on column public.notes.ai_sentiment is 'positive | neutral | negative, null якщо AI-аналіз не вдався';

create index if not exists notes_client_id_created_at_idx
  on public.notes (client_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- У проєкті немає авторизації користувачів (тестовий стенд), тому дозволяємо
-- усі CRUD-операції для ролей anon/authenticated. anon key з фронтенду має
-- рівно ці й тільки ці права — жодних інших операцій з БД він виконати не може.
-- ----------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.notes enable row level security;

drop policy if exists "clients_select_all" on public.clients;
drop policy if exists "clients_insert_all" on public.clients;
drop policy if exists "clients_update_all" on public.clients;
drop policy if exists "clients_delete_all" on public.clients;

create policy "clients_select_all" on public.clients
  for select to anon, authenticated using (true);

create policy "clients_insert_all" on public.clients
  for insert to anon, authenticated with check (true);

create policy "clients_update_all" on public.clients
  for update to anon, authenticated using (true) with check (true);

create policy "clients_delete_all" on public.clients
  for delete to anon, authenticated using (true);

drop policy if exists "notes_select_all" on public.notes;
drop policy if exists "notes_insert_all" on public.notes;
drop policy if exists "notes_update_all" on public.notes;
drop policy if exists "notes_delete_all" on public.notes;

create policy "notes_select_all" on public.notes
  for select to anon, authenticated using (true);

create policy "notes_insert_all" on public.notes
  for insert to anon, authenticated with check (true);

create policy "notes_update_all" on public.notes
  for update to anon, authenticated using (true) with check (true);

create policy "notes_delete_all" on public.notes
  for delete to anon, authenticated using (true);
