-- analytics_daily: cookieless first-party page-view counter.
-- Stores daily aggregated page views + unique visitor estimates.
-- No PII stored — the visitor hash is a daily-rotating HMAC that cannot
-- be reversed to identify any individual.
--
-- Columns:
--   date         — UTC calendar date of the view
--   page         — normalised path (no query strings, no trailing slash)
--   referrer     — coarsened referrer domain (or 'direct')
--   device       — 'mobile' | 'tablet' | 'desktop' | 'bot'
--   views        — total page view hits for this (date, page, referrer, device) bucket
--   unique_vis   — unique daily visitor estimates (HMAC hash deduplicated server-side,
--                  only the count is stored here)

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id          BIGSERIAL PRIMARY KEY,
  date        DATE        NOT NULL,
  page        TEXT        NOT NULL,
  referrer    TEXT        NOT NULL DEFAULT 'direct',
  device      TEXT        NOT NULL DEFAULT 'desktop',
  views       INTEGER     NOT NULL DEFAULT 0,
  unique_vis  INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (date, page, referrer, device)
);

-- Only the service role (server-side API routes) may write or read.
-- No public access needed — admin reads via supabaseAdmin.
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON public.analytics_daily
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for admin dashboard queries (filter by date range)
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date
  ON public.analytics_daily (date DESC);

-- Index for per-page queries
CREATE INDEX IF NOT EXISTS idx_analytics_daily_page_date
  ON public.analytics_daily (page, date DESC);

-- ── RPC: atomic upsert called by /api/track ───────────────────────────────────
-- Uses ON CONFLICT to increment counters atomically.
-- p_is_unique = true → also increment unique_vis.
CREATE OR REPLACE FUNCTION public.upsert_analytics_daily(
  p_date      DATE,
  p_page      TEXT,
  p_referrer  TEXT,
  p_device    TEXT,
  p_is_unique BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analytics_daily (date, page, referrer, device, views, unique_vis)
  VALUES (
    p_date, p_page, p_referrer, p_device,
    1,
    CASE WHEN p_is_unique THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, page, referrer, device)
  DO UPDATE SET
    views      = analytics_daily.views + 1,
    unique_vis = analytics_daily.unique_vis + CASE WHEN p_is_unique THEN 1 ELSE 0 END;
END;
$$;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION public.upsert_analytics_daily FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_analytics_daily TO service_role;
