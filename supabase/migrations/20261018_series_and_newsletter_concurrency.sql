-- ==============================================================================
-- Migration: 20261018_series_and_newsletter_concurrency.sql
-- Description:
--   1. Update series table status check constraint to allow ('published', 'draft')
--      matching application code and admin UI.
--   2. Add unique index on newsletter_log (series, week) to prevent concurrent
--      double-sends at the database level.
-- ==============================================================================

-- ── 1. Fix Series Status CHECK Constraint ─────────────────────────────────────
ALTER TABLE IF EXISTS public.series DROP CONSTRAINT IF EXISTS series_status_check;

-- Update legacy rows to new contract if any exist
UPDATE public.series SET status = 'published' WHERE status = 'active';
UPDATE public.series SET status = 'draft' WHERE status = 'inactive';

-- Apply new CHECK constraint
ALTER TABLE IF EXISTS public.series
  ADD CONSTRAINT series_status_check CHECK (status IN ('published', 'draft'));

-- Update column default to 'draft'
ALTER TABLE IF EXISTS public.series
  ALTER COLUMN status SET DEFAULT 'draft';


-- ── 2. Fix Newsletter Concurrency Double-Send Guard ───────────────────────────
-- Prevent concurrent cron executions from inserting multiple sentinel rows
-- for the same newsletter series in the same calendar week.
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_log_series_week_idx
  ON public.newsletter_log (series, (date_trunc('week', sent_at AT TIME ZONE 'UTC')));
