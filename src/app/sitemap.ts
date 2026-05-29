import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';
import { categories as staticCategories } from '@/data/categories';
import { authors as staticAuthors } from '@/data/authors';
import { series as staticSeries } from '@/data/series';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in').replace(/\/$/, '');

const TOOL_SLUGS = [
  'sip', 'lumpsum', 'swp', 'step-up-sip', 'mf-returns',
  'ppf', 'nps', 'epf',
  'home-loan', 'car-loan', 'education-loan', 'loan-prepayment',
  'income-tax', 'take-home-salary', 'gratuity',
  'rent-vs-buy', 'freelance-rate',
  'bmi', 'calories', 'water-intake', 'health-insurance',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/topics`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools/compare`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/financial-health`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/glossary`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/tags`,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/series`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/newsletter`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/search`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy-policy`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,                  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cookies`,                lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclaimer`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // ── Articles ─────────────────────────────────────────────────────────────
  let articlePages: MetadataRoute.Sitemap;
  try {
    const dbArticles = supabaseAdmin
      ? await supabaseAdmin
          .from('articles')
          .select('slug, updated_at, featured')
          .eq('status', 'published')
          .then(({ data }) => data)
      : null;

    if (dbArticles && dbArticles.length > 0) {
      articlePages = dbArticles.map((a) => ({
        url: `${BASE}/articles/${a.slug}`,
        lastModified: new Date(a.updated_at || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: a.featured ? 0.9 : 0.7,
      }));
    } else {
      articlePages = staticArticles.map((a) => ({
        url: `${BASE}/articles/${a.slug}`,
        lastModified: new Date(a.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: a.featured ? 0.9 : 0.7,
      }));
    }
  } catch {
    articlePages = staticArticles.map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: a.featured ? 0.9 : 0.7,
    }));
  }

  // ── Categories ────────────────────────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap;
  try {
    const dbCats = supabaseAdmin
      ? await supabaseAdmin.from('categories').select('slug').then(({ data }) => data)
      : null;
    const catSlugs = dbCats && dbCats.length > 0
      ? dbCats.map((c: { slug: string }) => c.slug)
      : staticCategories.map(c => c.slug);
    categoryPages = catSlugs.map((slug: string) => ({
      url: `${BASE}/topics/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch {
    categoryPages = staticCategories.map((c) => ({
      url: `${BASE}/topics/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  // ── Authors ───────────────────────────────────────────────────────────────
  let authorPages: MetadataRoute.Sitemap;
  try {
    const dbAuthors = supabaseAdmin
      ? await supabaseAdmin.from('authors').select('slug').eq('status', 'active').then(({ data }) => data)
      : null;
    const authorSlugs = dbAuthors && dbAuthors.length > 0
      ? dbAuthors.map((a: { slug: string }) => a.slug)
      : staticAuthors.map(a => a.slug);
    authorPages = authorSlugs.map((slug: string) => ({
      url: `${BASE}/author/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    authorPages = staticAuthors.map((a) => ({
      url: `${BASE}/author/${a.slug}`,
      lastModified: new Date(),
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
      ? await supabaseAdmin.from('articles').select('tags').eq('status', 'published').then(({ data }) => data)
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
          lastModified: new Date(),
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
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
    }
  } catch {
    tagPages = [];
  }

  const toolPages: MetadataRoute.Sitemap = TOOL_SLUGS.map((slug) => ({
    url: `${BASE}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ── Series ────────────────────────────────────────────────────────────────
  let seriesPages: MetadataRoute.Sitemap;
  try {
    const dbSeries = supabaseAdmin
      ? await supabaseAdmin
          .from('series')
          .select('slug, updated_at')
          .eq('status', 'published')
          .then(({ data }) => data)
      : null;
    const seriesSlugs = dbSeries && dbSeries.length > 0
      ? dbSeries.map((s: { slug: string; updated_at: string | null }) => ({ slug: s.slug, updated: s.updated_at }))
      : staticSeries.map(s => ({ slug: s.slug, updated: null }));
    seriesPages = seriesSlugs.map(({ slug, updated }) => ({
      url: `${BASE}/series/${slug}`,
      lastModified: updated ? new Date(updated) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    seriesPages = staticSeries.map(s => ({
      url: `${BASE}/series/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  }

  return [
    ...staticPages,
    ...articlePages,
    ...categoryPages,
    ...authorPages,
    ...toolPages,
    ...tagPages,
    ...seriesPages,
  ];
}
