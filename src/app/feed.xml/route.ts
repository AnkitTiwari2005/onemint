import { NextResponse } from 'next/server';
import { fetchPublishedArticles } from '@/lib/articles';
import { ENV } from '@/lib/env';

export const revalidate = 3600; // 1 hour

function escapeCdata(str: string): string {
  return str.replace(/]]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
  const { articles } = await fetchPublishedArticles();
  const recentArticles = (articles || []).slice(0, 25);
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
      const authorName = article.authors?.name
        ? `<author><![CDATA[${escapeCdata(article.authors.name)}]]></author>`
        : '';

      return `    <item>
      <title><![CDATA[${escapeCdata(article.title || '')}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${escapeCdata(article.excerpt || '')}]]></description>
      ${categoryName}
      ${authorName}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
