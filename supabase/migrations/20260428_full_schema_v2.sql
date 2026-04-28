-- ============================================================
-- OneMint — Full Schema Migration v2  (idempotent, safe to re-run)
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
drop policy if exists "admin_only_contact_messages" on public.contact_messages;
create policy "admin_only_contact_messages"
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
drop policy if exists "admin_only_author_applications" on public.author_applications;
create policy "admin_only_author_applications"
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
drop policy if exists "admin_only_article_likes" on public.article_likes;
create policy "admin_only_article_likes"
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
drop policy if exists "admin_only_article_feedback" on public.article_feedback;
create policy "admin_only_article_feedback"
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
drop policy if exists "public_read_glossary"  on public.glossary_terms;
drop policy if exists "admin_write_glossary"  on public.glossary_terms;
create policy "public_read_glossary"
  on public.glossary_terms for select using (true);
create policy "admin_write_glossary"
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
drop policy if exists "public_read_authors" on public.authors;
drop policy if exists "admin_write_authors" on public.authors;
create policy "public_read_authors"
  on public.authors for select using (true);
create policy "admin_write_authors"
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
drop policy if exists "public_read_categories" on public.categories;
drop policy if exists "admin_write_categories" on public.categories;
create policy "public_read_categories"
  on public.categories for select using (true);
create policy "admin_write_categories"
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
drop policy if exists "public_read_series" on public.series;
drop policy if exists "admin_write_series"  on public.series;
create policy "public_read_series"
  on public.series for select using (true);
create policy "admin_write_series"
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
drop policy if exists "admin_only_settings" on public.site_settings;
create policy "admin_only_settings"
  on public.site_settings for all using (false);

-- ─────────────────────────────────────────────
-- 10. newsletter_subscribers
-- ─────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  status     text not null default 'active' check (status in ('active','unsubscribed')),
  source     text not null default 'website',
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "admin_only_subscribers" on public.newsletter_subscribers;
create policy "admin_only_subscribers"
  on public.newsletter_subscribers for all using (false);

-- ─────────────────────────────────────────────
-- 11. articles
-- ─────────────────────────────────────────────
create table if not exists public.articles (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  excerpt           text not null default '',
  content           text not null default '',
  cover_image       text not null default '',
  category_id       uuid references public.categories(id) on delete set null,
  author_id         uuid references public.authors(id) on delete set null,
  tags              text[] not null default '{}',
  read_time_minutes integer not null default 5,
  status            text not null default 'draft' check (status in ('draft','published','archived')),
  meta_title        text not null default '',
  meta_description  text not null default '',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.articles enable row level security;
drop policy if exists "public_read_articles" on public.articles;
drop policy if exists "admin_write_articles" on public.articles;
create policy "public_read_articles"
  on public.articles for select using (status = 'published');
create policy "admin_write_articles"
  on public.articles for all using (false);

-- ─────────────────────────────────────────────
-- 12. topic_suggestions
-- ─────────────────────────────────────────────
create table if not exists public.topic_suggestions (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text not null,
  votes      integer not null default 0,
  status     text not null default 'requested' check (status in ('requested','planned','under-review','written')),
  created_at timestamptz not null default now()
);
alter table public.topic_suggestions enable row level security;
drop policy if exists "public_read_suggestions" on public.topic_suggestions;
drop policy if exists "admin_write_suggestions" on public.topic_suggestions;
create policy "public_read_suggestions"
  on public.topic_suggestions for select using (true);
create policy "admin_write_suggestions"
  on public.topic_suggestions for all using (false);

-- ─────────────────────────────────────────────
-- 12. suggestion_votes
-- ─────────────────────────────────────────────
create table if not exists public.suggestion_votes (
  suggestion_id    uuid not null references public.topic_suggestions(id) on delete cascade,
  user_fingerprint text not null,
  created_at       timestamptz not null default now(),
  primary key (suggestion_id, user_fingerprint)
);
alter table public.suggestion_votes enable row level security;
drop policy if exists "admin_only_suggestion_votes" on public.suggestion_votes;
create policy "admin_only_suggestion_votes"
  on public.suggestion_votes for all using (false);

-- ─────────────────────────────────────────────
-- Force PostgREST to reload schema cache
-- ─────────────────────────────────────────────
notify pgrst, 'reload schema';
