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

-- issues/gemba/jobcards/audits already have RLS enabled + a "public read/write"
-- policy from earlier setup — only complaints is new, so only it needs a policy
-- (re-running create policy on the others would error with "already exists").
alter table public.complaints enable row level security;
create policy "public read/write" on public.complaints for all using (true) with check (true);
