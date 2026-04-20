import type { MetadataRoute } from 'next';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { authors } from '@/data/authors';

const BASE = 'https://onemint.com';

const TOOL_SLUGS = [
  'sip', 'lumpsum', 'swp', 'step-up-sip', 'mf-returns',
  'ppf', 'nps', 'epf',
  'home-loan', 'car-loan', 'education-loan', 'loan-prepayment',
  'income-tax', 'take-home-salary', 'gratuity',
  'rent-vs-buy', 'freelance-rate',
  'bmi', 'calories', 'water-intake', 'health-insurance',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                            lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/topics`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools/compare`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/financial-health`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/glossary`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/tags`,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/series`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/newsletter`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/about`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/search`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy-policy`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/cookies`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclaimer`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: a.featured ? 0.9 : 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/topics/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const authorPages: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${BASE}/author/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOL_SLUGS.map((slug) => ({
    url: `${BASE}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Tag pages — derive unique tags from all articles
  const allTags = [...new Set(articles.flatMap((a) => a.tags))];
  const tagPages: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${BASE}/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...articlePages,
    ...categoryPages,
    ...authorPages,
    ...toolPages,
    ...tagPages,
  ];
}
