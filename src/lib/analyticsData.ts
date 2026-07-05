/**
 * analyticsData.ts — Server-side lazy-cache for Trending Now & Most Read This Week.
 *
 * Data is stored in the Supabase `analytics_cache` table and refreshed
 * on-demand when TTL expires (no extra Vercel cron job needed).
 *
 * Most Read This Week:
 *   Primary  → GA4 top article pages by pageviews (last 7 days)
 *   Fallback → Supabase view_count column
 *   Stale    → Last cached value
 *   TTL      → Refreshes every Monday at 1:00 AM IST
 *
 * Trending Now:
 *   Source   → Supabase engagement score (views + 5*likes + 10*comments)
 *   Stale    → Last cached value
 *   TTL      → 24 hours
 */

import { supabaseAdmin } from './supabase';
import { getTopPages, extractDimension, extractMetric } from './ga4';

// ── Cache keys ────────────────────────────────────────────────────────────────
const MOST_READ_KEY = 'most_read_weekly';
const TRENDING_KEY = 'trending_daily';

// ── TTL helpers ───────────────────────────────────────────────────────────────

/**
 * Returns the most recent Monday at 01:00 AM IST (UTC+5:30).
 * This is the "refresh boundary" — if cache was updated before this, it's stale.
 */
function getLastMondayIST(): Date {
  const now = new Date();
  // Convert to IST by adding 5h 30m
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  // Find last Monday (day 1 in JS, where 0 = Sunday)
  const dayOfWeek = istNow.getUTCDay(); // 0=Sun, 1=Mon, ...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(istNow);
  lastMonday.setUTCDate(lastMonday.getUTCDate() - daysSinceMonday);
  lastMonday.setUTCHours(1, 0, 0, 0); // 1:00 AM IST

  // Convert back to UTC for comparison
  return new Date(lastMonday.getTime() - istOffsetMs);
}

/** Check if a timestamp is older than 24 hours ago. */
function isOlderThan24h(updatedAt: string): boolean {
  const updated = new Date(updatedAt).getTime();
  return Date.now() - updated > 24 * 60 * 60 * 1000;
}

/** Check if a timestamp is before the last Monday 1 AM IST. */
function isBeforeLastMonday(updatedAt: string): boolean {
  const updated = new Date(updatedAt).getTime();
  const boundary = getLastMondayIST().getTime();
  return updated < boundary;
}

// ── Cache read/write ──────────────────────────────────────────────────────────

interface CacheRow {
  key: string;
  data: string[];
  source: string;
  updated_at: string;
}

async function readCache(key: string): Promise<CacheRow | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics_cache')
      .select('key, data, source, updated_at')
      .eq('key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data as CacheRow;
  } catch {
    return null;
  }
}

async function writeCache(key: string, slugs: string[], source: string): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin
      .from('analytics_cache')
      .upsert({ key, data: slugs, source, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch (e) {
    console.error('[analyticsData] Cache write error:', e);
  }
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

/**
 * Fetch top article slugs from GA4 (Tier 1).
 * Returns null on any failure (token expired, API error, timeout).
 */
async function fetchFromGA4(limit: number): Promise<string[] | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report: any = await getTopPages();
    if (!report?.rows?.length) return null;

    const slugs: string[] = [];
    for (const row of report.rows) {
      const path = extractDimension(row, 0); // e.g. "/articles/some-slug"
      if (path.startsWith('/articles/')) {
        const slug = path.replace('/articles/', '').replace(/\/$/, '');
        if (slug && !slugs.includes(slug)) {
          slugs.push(slug);
        }
      }
      if (slugs.length >= limit) break;
    }
    return slugs.length > 0 ? slugs : null;
  } catch (e) {
    console.error('[analyticsData] GA4 fetch failed:', e);
    return null;
  }
}

/**
 * Fetch top article slugs by view_count from Supabase (Tier 2).
 */
async function fetchFromSupabaseViewCount(limit: number): Promise<string[] | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('slug, view_count')
      .eq('status', 'published')
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error || !data || data.length === 0) return null;
    return data.map((row: { slug: string }) => row.slug);
  } catch {
    return null;
  }
}

/**
 * Fetch top articles by engagement score from Supabase.
 * Score = view_count + (likes * 5) + (approved comments * 10)
 */
async function fetchTrendingFromSupabase(limit: number): Promise<string[] | null> {
  if (!supabaseAdmin) return null;
  try {
    // Fetch articles with view_count
    const { data: articles, error: artErr } = await supabaseAdmin
      .from('articles')
      .select('slug, view_count')
      .eq('status', 'published')
      .is('deleted_at', null);
    if (artErr || !articles || articles.length === 0) return null;

    // Fetch like counts per article
    const { data: likesData } = await supabaseAdmin
      .from('article_likes')
      .select('article_slug');

    // Fetch approved comment counts per article
    const { data: commentsData } = await supabaseAdmin
      .from('comments')
      .select('article_slug')
      .eq('status', 'approved');

    // Build likes count map
    const likesMap: Record<string, number> = {};
    if (likesData) {
      for (const row of likesData) {
        const slug = (row as { article_slug: string }).article_slug;
        likesMap[slug] = (likesMap[slug] || 0) + 1;
      }
    }

    // Build comments count map
    const commentsMap: Record<string, number> = {};
    if (commentsData) {
      for (const row of commentsData) {
        const slug = (row as { article_slug: string }).article_slug;
        commentsMap[slug] = (commentsMap[slug] || 0) + 1;
      }
    }

    // Calculate engagement scores
    const scored = articles.map((a: { slug: string; view_count: number | null }) => {
      const views = a.view_count ?? 0;
      const likes = likesMap[a.slug] ?? 0;
      const comments = commentsMap[a.slug] ?? 0;
      return {
        slug: a.slug,
        score: views + (likes * 5) + (comments * 10),
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.slug);
  } catch (e) {
    console.error('[analyticsData] Trending fetch failed:', e);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the 5 most-read article slugs from the past week.
 *
 * Fallback chain:
 *   1. GA4 top pages (real pageviews)
 *   2. Supabase view_count (DB counter)
 *   3. Last cached value (stale but better than nothing)
 *   4. Empty array (HomePageClient falls back to articles.slice())
 */
export async function getMostReadWeekly(): Promise<string[]> {
  // Step 1: Check cache
  const cached = await readCache(MOST_READ_KEY);

  // If cache is fresh (updated after last Monday 1 AM IST), return immediately
  if (cached && !isBeforeLastMonday(cached.updated_at)) {
    return cached.data;
  }

  // Step 2: Cache is stale or missing — try GA4
  const ga4Slugs = await fetchFromGA4(5);
  if (ga4Slugs) {
    // Fire-and-forget cache write
    writeCache(MOST_READ_KEY, ga4Slugs, 'ga4').catch(() => {});
    return ga4Slugs;
  }

  // Step 3: GA4 failed — try Supabase view_count
  const dbSlugs = await fetchFromSupabaseViewCount(5);
  if (dbSlugs) {
    writeCache(MOST_READ_KEY, dbSlugs, 'supabase').catch(() => {});
    return dbSlugs;
  }

  // Step 4: Both failed — return stale cache or empty
  if (cached) {
    return cached.data;
  }

  return [];
}

/**
 * Get the 8 trending article slugs by engagement score.
 *
 * Fallback chain:
 *   1. Supabase engagement query (views + likes + comments)
 *   2. Last cached value
 *   3. Empty array
 */
export async function getTrendingDaily(): Promise<string[]> {
  // Step 1: Check cache
  const cached = await readCache(TRENDING_KEY);

  // If cache is fresh (< 24h old), return immediately
  if (cached && !isOlderThan24h(cached.updated_at)) {
    return cached.data;
  }

  // Step 2: Cache is stale or missing — fetch from Supabase
  const trendingSlugs = await fetchTrendingFromSupabase(8);
  if (trendingSlugs) {
    writeCache(TRENDING_KEY, trendingSlugs, 'supabase').catch(() => {});
    return trendingSlugs;
  }

  // Step 3: Supabase failed — return stale cache or empty
  if (cached) {
    return cached.data;
  }

  return [];
}
