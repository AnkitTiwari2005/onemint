import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';
import { categories as staticCategories } from '@/data/categories';
import { authors as staticAuthors } from '@/data/authors';
import { series as staticSeries } from '@/data/series';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com').replace(/\/$/, '');

// Revalidate sitemap every hour — prevents DB hammering on every crawler request.
// New articles/authors appear within 1 hour without a redeploy.
export const revalidate = 3600;


const TOOL_SLUGS = [
  'sip', 'lumpsum', 'swp', 'step-up-sip', 'mf-returns',
  'ppf', 'nps', 'epf',
  'home-loan', 'car-loan', 'education-loan', 'loan-prepayment',
  'income-tax', 'take-home-salary', 'gratuity',
  'rent-vs-buy', 'freelance-rate',
  'bmi', 'calories', 'water-intake', 'health-insurance',
  'fd-calculator', 'goal-sip', 'hra-calculator',
  'inflation-calculator', 'retirement-corpus',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Articles ─────────────────────────────────────────────────────────────
  const publishedSlugsSet = new Set<string>();
  let articlePages: MetadataRoute.Sitemap;
  let latestArticleDate: Date | undefined = undefined;

  try {
    const dbArticles = supabaseAdmin
      ? await supabaseAdmin
          .from('articles')
          .select('slug, updated_at, featured')
          .eq('status', 'published')
          .is('deleted_at', null)
          .then(({ data }) => data)
      : null;

    if (dbArticles && dbArticles.length > 0) {
      dbArticles.forEach((a) => {
        if (a.slug) publishedSlugsSet.add(a.slug);
        if (a.updated_at) {
          const d = new Date(a.updated_at);
          if (!isNaN(d.getTime())) {
            if (!latestArticleDate || d > latestArticleDate) latestArticleDate = d;
          }
        }
      });
      articlePages = dbArticles.map((a) => ({
        url: `${BASE}/articles/${a.slug}`,
        ...(a.updated_at && !isNaN(new Date(a.updated_at).getTime()) ? { lastModified: new Date(a.updated_at) } : {}),
        changeFrequency: 'monthly' as const,
        priority: a.featured ? 0.9 : 0.7,
      }));
    } else {
      staticArticles.forEach((a) => {
        if (a.slug) publishedSlugsSet.add(a.slug);
        if (a.updatedAt) {
          const d = new Date(a.updatedAt);
          if (!isNaN(d.getTime())) {
            if (!latestArticleDate || d > latestArticleDate) latestArticleDate = d;
          }
        }
      });
      articlePages = staticArticles.map((a) => ({
        url: `${BASE}/articles/${a.slug}`,
        ...(a.updatedAt && !isNaN(new Date(a.updatedAt).getTime()) ? { lastModified: new Date(a.updatedAt) } : {}),
        changeFrequency: 'monthly' as const,
        priority: a.featured ? 0.9 : 0.7,
      }));
    }
  } catch {
    staticArticles.forEach((a) => {
      if (a.slug) publishedSlugsSet.add(a.slug);
      if (a.updatedAt) {
        const d = new Date(a.updatedAt);
        if (!isNaN(d.getTime())) {
          if (!latestArticleDate || d > latestArticleDate) latestArticleDate = d;
        }
      }
    });
    articlePages = staticArticles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      ...(a.updatedAt && !isNaN(new Date(a.updatedAt).getTime()) ? { lastModified: new Date(a.updatedAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: a.featured ? 0.9 : 0.7,
    }));
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                             ...(latestArticleDate ? { lastModified: latestArticleDate } : {}), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/articles`,               ...(latestArticleDate ? { lastModified: latestArticleDate } : {}), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/topics`,                 ...(latestArticleDate ? { lastModified: latestArticleDate } : {}), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools`,                  changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools/compare`,          changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/financial-health`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/glossary`,               changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/tags`,                   ...(latestArticleDate ? { lastModified: latestArticleDate } : {}), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/newsletter`,             changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,                  changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,                changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/editorial-policy`,       changeFrequency: 'yearly',  priority: 0.4 },
    // /search intentionally excluded — pure client-side UI, no indexable content
    { url: `${BASE}/privacy-policy`,         changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,                  changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cookies`,                changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclaimer`,             changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // ── Categories ────────────────────────────────────────────────────────────
  // Only include categories that have ≥5 published articles — thin category pages
  // waste crawl budget and signal low-quality content to Google.
  const MIN_CATEGORY_ARTICLES = 5;
  let categoryPages: MetadataRoute.Sitemap;
  try {
    if (supabaseAdmin) {
      // Count published articles per category_id
      const { data: articlesWithCats } = await supabaseAdmin
        .from('articles')
        .select('category_id')
        .eq('status', 'published')
        .is('deleted_at', null);

      if (articlesWithCats && articlesWithCats.length > 0) {
        // Count articles per category
        const catArticleCounts: Record<string, number> = {};
        for (const row of articlesWithCats as { category_id: string | null }[]) {
          if (row.category_id) {
            catArticleCounts[row.category_id] = (catArticleCounts[row.category_id] || 0) + 1;
          }
        }
        // Only include categories that meet the minimum threshold
        const activeCategories = staticCategories.filter(
          c => (catArticleCounts[c.id] ?? catArticleCounts[c.slug] ?? 0) >= MIN_CATEGORY_ARTICLES
        );
        categoryPages = activeCategories.map((c) => ({
          url: `${BASE}/topics/${c.slug}`,
          ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
      } else {
        // DB available but no published articles yet — omit all categories
        categoryPages = [];
      }
    } else {
      // No DB — fall back to all static categories
      categoryPages = staticCategories.map((c) => ({
        url: `${BASE}/topics/${c.slug}`,
        ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch {
    categoryPages = staticCategories.map((c) => ({
      url: `${BASE}/topics/${c.slug}`,
      ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  // ── Authors ───────────────────────────────────────────────────────────────
  // Only include authors with articleCount > 0 — empty author pages are thin content
  let authorPages: MetadataRoute.Sitemap;
  try {
    if (supabaseAdmin) {
      const [{ data: dbAuthors }, { data: dbArticlesForAuthors }] = await Promise.all([
        supabaseAdmin.from('authors').select('id, slug').eq('status', 'active').is('deleted_at', null),
        supabaseAdmin.from('articles').select('author_id').eq('status', 'published').is('deleted_at', null),
      ]);
      const authorIdCounts = new Set<string>();
      (dbArticlesForAuthors || []).forEach((a: { author_id?: string | null }) => {
        if (a.author_id) authorIdCounts.add(a.author_id);
      });
      const activeAuthors = (dbAuthors || []).filter((a: { id: string }) => authorIdCounts.has(a.id));
      authorPages = activeAuthors.map((a: { slug: string }) => ({
        url: `${BASE}/author/${a.slug}`,
        ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    } else {
      const authorArticleCounts = new Set<string>();
      staticArticles.forEach(a => { if (a.authorId) authorArticleCounts.add(a.authorId); });
      authorPages = staticAuthors
        .filter(a => authorArticleCounts.has(a.id) || authorArticleCounts.has(a.slug))
        .map(a => ({
          url: `${BASE}/author/${a.slug}`,
          ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    }
  } catch {
    authorPages = staticAuthors.map((a) => ({
      url: `${BASE}/author/${a.slug}`,
      ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  // Only include tag pages with 3+ articles — thin tag pages waste crawl budget
  // and signal low quality to Google. Tags with 1-2 articles don't deserve their
  // own indexed page yet.
  const MIN_TAG_ARTICLES = 3;
  let tagPages: MetadataRoute.Sitemap;
  try {
    const dbTags = supabaseAdmin
      ? await supabaseAdmin.from('articles').select('tags').eq('status', 'published').is('deleted_at', null).then(({ data }) => data)
      : null;
    if (dbTags && dbTags.length > 0) {
      const tagCounts: Record<string, number> = {};
      dbTags.forEach((row: { tags: string[] | null }) =>
        (row.tags ?? []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; })
      );
      tagPages = Object.entries(tagCounts)
        .filter(([, count]) => count >= MIN_TAG_ARTICLES)
        .map(([tag]) => ({
          url: `${BASE}/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`,
          ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    } else {
      // Static fallback — count tag occurrences
      const tagCounts: Record<string, number> = {};
      staticArticles.forEach(a => a.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
      tagPages = Object.entries(tagCounts)
        .filter(([, count]) => count >= MIN_TAG_ARTICLES)
        .map(([tag]) => ({
          url: `${BASE}/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`,
          ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    }
  } catch {
    tagPages = [];
  }

  const toolPages: MetadataRoute.Sitemap = TOOL_SLUGS.map((slug) => ({
    url: `${BASE}/tools/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── Series ────────────────────────────────────────────────────────────────
  // Only include series with >= 1 published article. Omit empty series from Google's discovery tree.
  let seriesPages: MetadataRoute.Sitemap = [];
  let seriesHubPages: MetadataRoute.Sitemap = [];
  try {
    const dbSeries = supabaseAdmin
      ? await supabaseAdmin
          .from('series')
          .select('slug, updated_at, article_slugs')
          .eq('status', 'published')
          .is('deleted_at', null)
          .then(({ data }) => data)
      : null;

    if (dbSeries && dbSeries.length > 0) {
      const activeSeries = dbSeries.filter((s: { article_slugs?: string[] | null }) => {
        const slugs = Array.isArray(s.article_slugs) ? s.article_slugs : [];
        return slugs.some(slug => publishedSlugsSet.has(slug));
      });
      seriesPages = activeSeries.map((s: { slug: string; updated_at: string | null }) => ({
        url: `${BASE}/series/${s.slug}`,
        ...(s.updated_at && !isNaN(new Date(s.updated_at).getTime()) ? { lastModified: new Date(s.updated_at) } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    } else {
      const activeStaticSeries = staticSeries.filter(s =>
        (s.articleSlugs || []).some(slug => publishedSlugsSet.has(slug))
      );
      seriesPages = activeStaticSeries.map(s => ({
        url: `${BASE}/series/${s.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    seriesPages = [];
  }

  // Only include root /series hub if there is at least 1 populated series
  if (seriesPages.length > 0) {
    seriesHubPages = [{
      url: `${BASE}/series`,
      ...(latestArticleDate ? { lastModified: latestArticleDate } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }];
  }

  return [
    ...staticPages,
    ...seriesHubPages,
    ...articlePages,
    ...categoryPages,
    ...authorPages,
    ...toolPages,
    ...tagPages,
    ...seriesPages,
  ];
}
