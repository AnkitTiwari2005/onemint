-- ============================================================
-- OneMint — Full Schema Migration v2
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. contact_messages
-- ─────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
-- Only service-role (supabaseAdmin) can read/write — anon gets nothing
create policy if not exists "admin_only_contact_messages"
  on public.contact_messages for all using (false);

-- ─────────────────────────────────────────────
-- 2. author_applications
-- ─────────────────────────────────────────────
create table if not exists public.author_applications (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  linkedin_url text default '',
  category     text not null,
  pitch        text not null,
  sample_url   text default '',
  type         text not null default 'guest',
  status       text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.author_applications enable row level security;
create policy if not exists "admin_only_author_applications"
  on public.author_applications for all using (false);

-- ─────────────────────────────────────────────
-- 3. article_likes  (fingerprint-based, no login required)
-- ─────────────────────────────────────────────
create table if not exists public.article_likes (
  id                uuid primary key default gen_random_uuid(),
  article_slug      text not null,
  user_fingerprint  text not null,
  created_at        timestamptz not null default now(),
  unique (article_slug, user_fingerprint)
);
alter table public.article_likes enable row level security;
-- Public users cannot directly read/write — all access goes through /api/likes (service role)
create policy if not exists "admin_only_article_likes"
  on public.article_likes for all using (false);

-- ─────────────────────────────────────────────
-- 4. article_feedback  (up/down votes)
-- ─────────────────────────────────────────────
create table if not exists public.article_feedback (
  id           uuid primary key default gen_random_uuid(),
  article_slug text not null,
  vote         text not null check (vote in ('up','down')),
  created_at   timestamptz not null default now()
);
alter table public.article_feedback enable row level security;
create policy if not exists "admin_only_article_feedback"
  on public.article_feedback for all using (false);

-- ─────────────────────────────────────────────
-- 5. glossary_terms
-- ─────────────────────────────────────────────
create table if not exists public.glossary_terms (
  id               uuid primary key default gen_random_uuid(),
  term             text not null,
  slug             text not null unique,
  short_definition text not null default '',
  full_definition  text not null default '',
  category         text not null default '',
  example          text not null default '',
  related_terms    text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.glossary_terms enable row level security;
-- Public can read; only service-role can write
create policy if not exists "public_read_glossary"
  on public.glossary_terms for select using (true);
create policy if not exists "admin_write_glossary"
  on public.glossary_terms for all using (false);

-- ─────────────────────────────────────────────
-- 6. authors
-- ─────────────────────────────────────────────
create table if not exists public.authors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  email       text,
  role        text not null default 'Contributor',
  bio         text not null default '',
  avatar      text not null default '',
  twitter     text not null default '',
  linkedin    text not null default '',
  website     text not null default '',
  status      text not null default 'active' check (status in ('active','inactive')),
  joined_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.authors enable row level security;
create policy if not exists "public_read_authors"
  on public.authors for select using (true);
create policy if not exists "admin_write_authors"
  on public.authors for all using (false);

-- ─────────────────────────────────────────────
-- 7. categories
-- ─────────────────────────────────────────────
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text not null default '',
  accent_color text not null default '#1B6B3A',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy if not exists "public_read_categories"
  on public.categories for select using (true);
create policy if not exists "admin_write_categories"
  on public.categories for all using (false);

-- ─────────────────────────────────────────────
-- 8. series
-- ─────────────────────────────────────────────
create table if not exists public.series (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text not null default '',
  cover_image     text not null default '',
  category_id     uuid references public.categories(id) on delete set null,
  article_slugs   text[] not null default '{}',
  total_read_time integer not null default 0,
  status          text not null default 'active' check (status in ('active','inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.series enable row level security;
create policy if not exists "public_read_series"
  on public.series for select using (true);
create policy if not exists "admin_write_series"
  on public.series for all using (false);

-- ─────────────────────────────────────────────
-- 9. site_settings  (key-value store)
-- ─────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy if not exists "admin_only_settings"
  on public.site_settings for all using (false);

-- ─────────────────────────────────────────────
-- 10. newsletter_subscribers (ensure exists)
-- ─────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  status     text not null default 'active' check (status in ('active','unsubscribed')),
  source     text not null default 'website',
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy if not exists "admin_only_subscribers"
  on public.newsletter_subscribers for all using (false);

-- ─────────────────────────────────────────────
-- Force PostgREST to reload schema cache
-- ─────────────────────────────────────────────
notify pgrst, 'reload schema';
