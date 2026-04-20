export interface ArticleSeries {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  articleSlugs: string[];
  coverImage: string;
  totalReadTime: number;
}

export const series: ArticleSeries[] = [
  {
    id: 'mutual-funds-101',
    slug: 'mutual-funds-101',
    name: 'Mutual Funds 101',
    description: 'A beginner-friendly, five-part deep-dive into how mutual funds work in India, how to pick the right ones, and how to build a long-term SIP portfolio that actually grows.',
    categoryId: 'finance',
    articleSlugs: [
      'building-wealth-in-your-30s',
      'salary-negotiation-india-2026',
      'india-real-estate-bubble',
      'epf-vs-ppf-comparison',
      'nifty-50-vs-nifty-next-50',
    ],
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    totalReadTime: 38,
  },
  {
    id: 'understanding-ai',
    slug: 'understanding-ai',
    name: 'Understanding AI',
    description: 'Four articles breaking down artificial intelligence from first principles — no jargon, no hype. By the end, you will understand how large language models work and what they mean for India.',
    categoryId: 'technology',
    articleSlugs: [
      'gpt5-indian-developers',
      'ev-adoption-india',
      'india-semiconductor-race',
      'india-digital-rupee-explained',
    ],
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    totalReadTime: 31,
  },
  {
    id: 'tax-filing-guide',
    slug: 'tax-filing-guide',
    name: 'Tax Filing Guide 2026',
    description: 'Everything an Indian salaried professional needs to file their ITR correctly, claim every deduction legally, and never get a tax notice. Updated for the new tax regime vs old regime comparison.',
    categoryId: 'finance',
    articleSlugs: [
      'salary-negotiation-india-2026',
      'building-wealth-in-your-30s',
      'epf-vs-ppf-comparison',
      'nifty-50-vs-nifty-next-50',
    ],
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
    totalReadTime: 35,
  },
  {
    id: 'fitness-fundamentals',
    slug: 'fitness-fundamentals',
    name: 'Fitness Fundamentals',
    description: 'Three science-backed articles on building sustainable fitness habits — covering nutrition, exercise, and preventive health for the modern Indian professional.',
    categoryId: 'health',
    articleSlugs: [
      'health-checkup-after-30',
      'menstrual-health-awareness',
      'yoga-vs-gym-comparison',
    ],
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
    totalReadTime: 19,
  },
];

export function getSeriesBySlug(slug: string): ArticleSeries | undefined {
  return series.find((s) => s.slug === slug);
}

export function getSeriesForArticle(articleSlug: string): ArticleSeries | undefined {
  return series.find((s) => s.articleSlugs.includes(articleSlug));
}
