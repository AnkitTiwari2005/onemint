import { NextResponse } from 'next/server';
import { fetchPublishedArticles, type PublicArticle } from '@/lib/articles';
import { ENV } from '@/lib/env';

export const revalidate = 3600; // 1 hour

function escapeCdata(str: string): string {
  return str.replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  let articles: PublicArticle[] = [];
  try {
    const res = await fetchPublishedArticles();
    if (res.degraded || !res.articles || res.articles.length === 0) {
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
    articles = res.articles;
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

  const recentArticles = articles.slice(0, 25);
  const siteUrl = ENV.SITE_URL || 'https://www.onemint.com';
  const buildDate = new Date().toUTCString();

  const itemsXml = recentArticles
    .map((article) => {
      const articleUrl = `${siteUrl}/articles/${article.slug}`;
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : buildDate;
      const categoryName = article.categories?.name
        ? `<category><![CDATA[${escapeCdata(article.categories.name)}]]></category>`
        : '';
      const authorCreator = article.authors?.name
        ? `<dc:creator><![CDATA[${escapeCdata(article.authors.name)}]]></dc:creator>`
        : '';

      return `    <item>
      <title><![CDATA[${escapeCdata(article.title || '')}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${escapeCdata(article.excerpt || '')}]]></description>
      ${categoryName}
      ${authorCreator}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>OneMint — Personal Finance, Technology &amp; Health</title>
    <link>${siteUrl}</link>
    <description>Expert articles on personal finance, technology, health, and careers. Free tools and calculators for better decisions.</description>
    <language>en-in</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
