import { NextResponse } from 'next/server';
import { fetchPublishedArticles, type PublicArticle } from '@/lib/articles';
import { ENV } from '@/lib/env';
import { generateRssFeedXml } from '@/lib/feed-generator';

export const revalidate = 3600; // 1 hour

export async function GET() {
  let articles: PublicArticle[] = [];
  try {
    const res = await fetchPublishedArticles();
    if (res.degraded) {
      // If DB is degraded/unreachable, do not inject static seed articles into the live RSS feed
      // which would cause RSS readers to publish ghost/duplicate historical articles.
      return new NextResponse('RSS feed temporarily unavailable. Please retry shortly.', {
        status: 503,
        headers: {
          'Retry-After': '300',
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
    articles = res.articles || [];
  } catch (err) {
    console.error('[feed.xml] Failed to fetch articles:', err);
    return new NextResponse('RSS feed temporarily unavailable. Please retry shortly.', {
      status: 503,
      headers: {
        'Retry-After': '300',
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  const siteUrl = ENV.SITE_URL || 'https://www.onemint.com';
  const xml = generateRssFeedXml(articles, siteUrl);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
