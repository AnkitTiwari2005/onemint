-- Comments table for article discussions
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email       TEXT,  -- optional, never shown publicly
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 2000),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_article_slug_status_idx ON public.comments (article_slug, status);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments (created_at DESC);
