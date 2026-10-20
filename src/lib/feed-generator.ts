import type { PublicArticle } from '@/lib/articles';

function escapeCdata(str: string): string {
  return str.replace(/]]>/g, ']]]]><![CDATA[>');
}

export function generateRssFeedXml(
  articles: PublicArticle[],
  siteUrl: string = 'https://www.onemint.com',
  buildDate: string = new Date().toUTCString()
): string {
  const recentArticles = articles.slice(0, 25);
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

  return `<?xml version="1.0" encoding="UTF-8"?>
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
}
