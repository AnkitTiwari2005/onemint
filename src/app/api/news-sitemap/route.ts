/**
 * Google News Sitemap — /api/news-sitemap
 *
 * Google News requires a dedicated sitemap that uses the <news:news> XML
 * namespace. Next.js's native MetadataRoute.Sitemap cannot emit these tags,
 * so we return raw XML from an API route instead.
 *
 * Spec: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 *
 * Rules enforced:
 *  - Only articles published within the last 48 hours are included
 *    (Google ignores older entries in the news sitemap)
 *  - Max 1,000 URLs per sitemap (Google limit)
 *  - Publication name must match your Google News registration name
 *  - Language is en (ISO 639-1)
 *  - Cache-Control: 5 minutes — fresh enough for Google's crawler without
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
// Google News only indexes articles from the last 48 hours
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

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

/** Format a date string to W3C Datetime format required by Google News */
function toW3CDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString(); // Already ISO 8601 / W3C Datetime compliant
}

export async function GET() {
  const now = Date.now();
  const cutoff = new Date(now - NEWS_WINDOW_MS).toISOString();

  let newsArticles: NewsArticleRow[] = [];

  // ── Fetch from DB ─────────────────────────────────────────────────────────
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('articles')
        .select('slug, title, published_at, categories(name)')
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('published_at', cutoff)
        .order('published_at', { ascending: false })
        .limit(1000); // Google News sitemap max

      if (!error && data && data.length > 0) {
        newsArticles = data as unknown as NewsArticleRow[];
      }
    } catch (err) {
      console.error('[news-sitemap] DB error:', err);
    }
  }

  // ── Static fallback (only used when DB is unreachable) ────────────────────
  if (newsArticles.length === 0) {
    newsArticles = staticArticles
      .filter((a) => {
        const pub = new Date(a.publishedAt).getTime();
        return pub >= now - NEWS_WINDOW_MS;
      })
      .slice(0, 1000)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        published_at: a.publishedAt,
        categories: null,
      }));
  }

  // ── Build XML ─────────────────────────────────────────────────────────────
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
      // Cache for 5 minutes at the CDN edge — frequent enough for breaking news,
      // cheap enough to not hammer the DB. Stale-while-revalidate gives bots a
      // cached response while Next.js fetches fresh data in the background.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
  });
}
