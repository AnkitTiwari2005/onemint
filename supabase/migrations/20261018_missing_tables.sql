-- Migration: Missing tables (M14 — migration drift fix)
-- These tables exist in production but were never added to migration files.
-- This migration documents their schema for future reference and new environment setup.
-- Run: supabase db push  (or apply via Supabase Dashboard > SQL Editor)
-- NOTE: Uses IF NOT EXISTS — safe to run even if tables already exist.

-- ── push_subscriptions ────────────────────────────────────────────────────────
-- Stores Web Push VAPID subscription objects per user/device.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  endpoint     TEXT        NOT NULL UNIQUE,
  p256dh       TEXT        NOT NULL,
  auth         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── advertise_enquiries ───────────────────────────────────────────────────────
-- Inbound advertising / sponsorship enquiries from the /advertise page.
CREATE TABLE IF NOT EXISTS public.advertise_enquiries (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  company      TEXT,
  budget       TEXT,
  message      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

-- ── newsletter_log ────────────────────────────────────────────────────────────
-- One row per newsletter issue sent; used for deduplication (double-send guard).
CREATE TABLE IF NOT EXISTS public.newsletter_log (
  id               BIGSERIAL PRIMARY KEY,
  series           TEXT        NOT NULL,          -- e.g. 'monday', 'wednesday', 'sunday'
  article_slugs    TEXT[]      NOT NULL DEFAULT '{}',
  subscriber_count INTEGER     NOT NULL DEFAULT 0,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── article_views ─────────────────────────────────────────────────────────────
-- Per-slug view count, incremented by the increment_view_count RPC.
CREATE TABLE IF NOT EXISTS public.article_views (
  slug    TEXT    PRIMARY KEY,
  count   INTEGER NOT NULL DEFAULT 0
);

-- ── RLS policies ─────────────────────────────────────────────────────────────
-- push_subscriptions: server-only (service role), no public read
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'push_subscriptions' AND policyname = 'service_role_only'
  ) THEN
    CREATE POLICY "service_role_only" ON public.push_subscriptions
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- advertise_enquiries: anon can INSERT (form submission), not read
ALTER TABLE public.advertise_enquiries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'advertise_enquiries' AND policyname = 'anon_insert'
  ) THEN
    CREATE POLICY "anon_insert" ON public.advertise_enquiries
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- newsletter_log: server-only reads/writes
ALTER TABLE public.newsletter_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'newsletter_log' AND policyname = 'service_role_only'
  ) THEN
    CREATE POLICY "service_role_only" ON public.newsletter_log
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- article_views: public read (for view count display), service role write
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_views' AND policyname = 'public_read'
  ) THEN
    CREATE POLICY "public_read" ON public.article_views
      FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'article_views' AND policyname = 'service_role_write'
  ) THEN
    CREATE POLICY "service_role_write" ON public.article_views
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
