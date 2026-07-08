-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists public.issues (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.issues disable row level security;

create table if not exists public.gemba (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.gemba disable row level security;

create table if not exists public.jobcards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.jobcards disable row level security;

create table if not exists public.audits (
  id text primary key,
  dept text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.audits disable row level security;
