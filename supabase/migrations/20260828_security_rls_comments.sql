-- Migration: security fixes + missing schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Covers:
--   1. Enable RLS on comments (critical — was fully open to anon key)
--   2. Column-level grant: strip email column from anon reads
--   3. Add missing parent_id column to comments (schema drift vs code)
--   4. Create comment_reactions table (referenced in code, never created)
--   5. RLS on comment_reactions

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add parent_id to comments (missing from original migration)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Enable RLS on comments
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_public_read" ON public.comments;

-- Anon/authenticated can only read approved rows
CREATE POLICY "comments_public_read"
  ON public.comments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Column-level security: prevent anon from reading email
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE SELECT ON public.comments FROM anon, authenticated;
GRANT SELECT (id, article_slug, name, body, created_at, parent_id)
  ON public.comments
  TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Create comment_reactions (referenced in code but never migrated)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  UUID        NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  emoji       TEXT        NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '💡', '😂')),
  fingerprint TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS comment_reactions_comment_id_idx
  ON public.comment_reactions (comment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS on comment_reactions
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_public_read" ON public.comment_reactions;

CREATE POLICY "reactions_public_read"
  ON public.comment_reactions
  FOR SELECT
  TO anon, authenticated
  USING (true);
