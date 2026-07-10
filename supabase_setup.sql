-- Run in Supabase: SQL Editor -> New query -> paste -> Run
--
-- Note: plain "disable row level security" did not stick in practice (Supabase's
-- own tooling re-enabled it). The working approach is to leave RLS ON and add an
-- explicit "allow everything" policy — functionally open access, but durable.

create table if not exists public.issues (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gemba (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.jobcards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audits (
  id text primary key,
  dept text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Flat schema (not the {id,data,created_at} wrapper pattern) since audit_log
-- rows are logged directly, not upserted/keyed by a record id.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  module text,
  created_at timestamptz not null default now()
);

-- issues/gemba/jobcards/audits/complaints/app_users already have RLS enabled
-- + a "public read/write" policy from earlier setup — only audit_log is new,
-- so only it needs a policy (re-running create policy on the others would
-- error with "already exists").
alter table public.audit_log enable row level security;
create policy "public read/write" on public.audit_log for all using (true) with check (true);
