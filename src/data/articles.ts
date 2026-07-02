export interface Article {
  id: string;
  title: string;
  slug: string;
  deck: string;
  excerpt: string;
  categoryId: string;
  /** Author slug — kept for backwards compat; prefer authorName/authorAvatar */
  authorId: string;
  /** Embedded from DB join — avoids static authors lookup in client components */
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  tags: string[];
  featuredImage: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  contentLevel: 'beginner' | 'intermediate' | 'advanced';
  featured: boolean;
  body?: string;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * Static articles have been removed. All content is served from Supabase.
 * This empty array is kept only so that existing imports don't break at compile time.
 * @deprecated Use fetchPublishedArticles() from @/lib/articles instead.
 */
export const articles: Article[] = [];

export function getArticlesByCategory(categoryId: string): Article[] {
  return articles.filter((a) => a.categoryId === categoryId);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticle(): Article | undefined {
  return articles.find((a) => a.featured) ?? articles[0];
}

export function getTrendingArticles(count = 8): Article[] {
  return articles.slice(0, count);
}

export function getMostReadArticles(count = 5): Article[] {
  return articles.slice(0, count);
}
