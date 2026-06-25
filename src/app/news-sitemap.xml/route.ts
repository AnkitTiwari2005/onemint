/**
 * Google News Sitemap — /news-sitemap.xml
 *
 * Google News requires a dedicated sitemap that uses the <news:news> XML
 * namespace. Next.js's native MetadataRoute.Sitemap cannot emit these tags,
 * so we return raw XML from a route handler instead.
 *
 * Spec: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 *
 * Why /news-sitemap.xml and NOT /api/news-sitemap:
 *   robots.txt disallows /api/ for all bots. Even with an Allow override,
 *   GSC's sitemap fetcher strictly honours the broader Disallow: /api/ rule
 *   and refuses to fetch sitemaps under that path. Placing the sitemap at
 *   the root level avoids the conflict entirely.
 *
 * Fetch strategy (never returns empty — prevents GSC "Missing XML tag" error):
 *  1. Try articles published in the last 48 h (ideal for Google News)
 *  2. If empty → expand to last 7 days
 *  3. If still empty → take the 10 most-recent articles regardless of date
 *     Google ignores articles older than 2 days for News ranking, but the
 *     sitemap XML itself must contain at least one <url> to pass validation.
 *
 * Other rules:
 *  - Max 1,000 URLs per sitemap (Google limit)
 *  - Publication name must match your Google News registration name exactly
 *  - Language is en (ISO 639-1)
 *  - Cache-Control: 5 minutes — fresh enough for breaking news without
 *    hammering the DB on every bot visit
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';

// Force dynamic — must reflect freshly published articles
export const dynamic = 'force-dynamic';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in').replace(/\/$/, '');
// Must match the exact publication name registered in Google Publisher Center
const PUBLICATION_NAME = 'OneMint';
const PUBLICATION_LANGUAGE = 'en';

const H48  = 48 * 60 * 60 * 1000;   // 48 hours in ms
const D7   = 7  * 24 * 60 * 60 * 1000; // 7 days in ms
const FALLBACK_COUNT = 10; // min articles to always show

interface NewsArticleRow {
  slug: string;
  title: string;
  published_at: string | null;
  categories: { name: string } | null;
}

/** Escape XML special characters to prevent malformed XML */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Format a date string to W3C Datetime / ISO 8601 format required by Google News */
function toW3CDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/**
 * Query DB with a time-based cutoff.
 * Returns null if DB unavailable, empty array if no results.
 */
async function queryDb(cutoff: string): Promise<NewsArticleRow[] | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('slug, title, published_at, categories(name)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .gte('published_at', cutoff)
      .order('published_at', { ascending: false })
      .limit(1000);
    if (error) {
      console.error('[news-sitemap.xml] DB error:', error.message);
      return null;
    }
    return (data ?? []) as unknown as NewsArticleRow[];
  } catch (err) {
    console.error('[news-sitemap.xml] Unexpected DB error:', err);
    return null;
  }
}

/** Last-resort DB fetch — most recent N articles with no date filter */
async function queryDbRecent(limit: number): Promise<NewsArticleRow[] | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('slug, title, published_at, categories(name)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) return null;
    return (data ?? []) as unknown as NewsArticleRow[];
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();

  let newsArticles: NewsArticleRow[] = [];
  const dbAvailable = !!supabaseAdmin;

  // ── Step 1: last 48 hours ─────────────────────────────────────────────────
  const cutoff48 = new Date(now - H48).toISOString();
  const result48 = await queryDb(cutoff48);
  if (result48 && result48.length > 0) {
    newsArticles = result48;
  }

  // ── Step 2: last 7 days (if step 1 was empty) ─────────────────────────────
  if (newsArticles.length === 0 && dbAvailable) {
    const cutoff7d = new Date(now - D7).toISOString();
    const result7d = await queryDb(cutoff7d);
    if (result7d && result7d.length > 0) {
      newsArticles = result7d;
    }
  }

  // ── Step 3: most-recent N articles regardless of date ─────────────────────
  if (newsArticles.length === 0 && dbAvailable) {
    const recent = await queryDbRecent(FALLBACK_COUNT);
    if (recent && recent.length > 0) {
      newsArticles = recent;
    }
  }

  // ── Step 4: static fallback (DB totally unreachable) ─────────────────────
  if (newsArticles.length === 0) {
    // Try 48h window in static data first
    const static48 = staticArticles.filter(
      (a) => new Date(a.publishedAt).getTime() >= now - H48
    );
    // Widen to all static articles if the 48h window is empty
    const staticPool = static48.length > 0 ? static48 : staticArticles;
    newsArticles = staticPool
      .slice(0, 1000)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        published_at: a.publishedAt,
        categories: null,
      }));
  }

  // ── Build XML ──────────────────────────────────────────────────────────────
  const urlEntries = newsArticles
    .map((article) => {
      const url = `${BASE}/articles/${article.slug}`;
      const pubDate = article.published_at
        ? toW3CDate(article.published_at)
        : new Date().toISOString();
      const title = escapeXml(article.title);

      return `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${PUBLICATION_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // 5 min CDN cache — fresh enough for breaking news,
      // cheap enough to not hammer the DB on every bot request.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
  });
}
