/**
 * Shared article fetching helpers — used by both API routes and server components.
 * Single source of truth so DB logic isn't duplicated.
 */

import { supabaseAdmin } from './supabase';
import { articles as staticArticles } from '@/data/articles';
import type { Article } from '@/data/articles';
import { getCategoryById } from '@/data/categories';


export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  tags: string[] | null;
  read_time_minutes: number | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faqs: { question: string; answer: string }[] | null;
  is_sponsored?: boolean | null;
  sponsor_name?: string | null;
  correction_note?: string | null;
  updated_at?: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    accent_color?: string | null;
    light_color?: string | null;
  } | null;
  authors: {
    id: string;
    name: string;
    slug: string;
    bio?: string | null;
    avatar?: string | null;
    role?: string | null;
  } | null;
}

/** Map a static article to the shared PublicArticle shape */
function staticToPublic(a: typeof staticArticles[number]): PublicArticle {
  const cat = getCategoryById(a.categoryId);
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: null,
    cover_image: a.featuredImage,
    category_id: a.categoryId,
    tags: a.tags,
    read_time_minutes: a.readTimeMinutes,
    published_at: a.publishedAt,
    meta_title: a.title,
    meta_description: a.excerpt,
    faqs: null,
    categories: cat
      ? { id: cat.id, name: cat.name, slug: cat.slug, accent_color: cat.accentColor, light_color: cat.lightColor }
      : null,
    authors: null,
  };
}

/** Fetch all published articles. Falls back to static data if DB unavailable/empty. */
export async function fetchPublishedArticles(): Promise<{
  articles: PublicArticle[];
  source: 'db' | 'static';
  degraded: boolean;
}> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('articles')
        .select(
          'id, title, slug, excerpt, cover_image, featured, ' +
          'category_id, tags, read_time_minutes, published_at, ' +
          'categories(*), ' +
          'authors(id, name, slug, avatar, role)'
        )
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          return {
            articles: data as unknown as PublicArticle[],
            source: 'db',
            degraded: false,
          };
        }
        // DB is reachable but has 0 published articles — authoritative empty state
        console.warn('[fetchPublishedArticles] DB returned 0 published articles — returning empty (not static fallback)');
        return { articles: [], source: 'db', degraded: false };
      }
      if (error) {
        console.error('[fetchPublishedArticles] DB error:', error.message);
      }
    } catch (err) {
      console.error('[fetchPublishedArticles] Unexpected:', err);
    }
  }

  // Only reach here if DB is unreachable or threw
  return {
    articles: staticArticles.map(staticToPublic),
    source: 'static',
    degraded: true,
  };
}

/** Fetch a single published article by slug. Returns null if not found. */
export async function fetchPublishedArticleBySlug(slug: string): Promise<{
  article: PublicArticle | null;
  source: 'db' | 'static';
}> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('articles')
        .select(
          'id, title, slug, excerpt, content, cover_image, ' +
          'category_id, tags, read_time_minutes, published_at, ' +
          'meta_title, meta_description, faqs, ' +
          'is_sponsored, sponsor_name, correction_note, updated_at, ' +
          'categories(*), ' +
          'authors(*)'
        )
        .eq('slug', slug)
        .eq('status', 'published')
        .is('deleted_at', null)
        .maybeSingle();

      if (!error && data) {
        return { article: data as unknown as PublicArticle, source: 'db' };
      }
      if (error) {
        console.error('[fetchPublishedArticleBySlug] DB error:', error.message);
      }
    } catch (err) {
      console.error('[fetchPublishedArticleBySlug] Unexpected:', err);
    }
  }

  // Fallback to static data
  const staticArticle = staticArticles.find((a) => a.slug === slug);
  if (staticArticle) {
    return { article: staticToPublic(staticArticle), source: 'static' };
  }

  return { article: null, source: 'static' };
}

/**
 * Convert a PublicArticle (DB shape) to the Article shape expected by
 * ArticleCard and other components that import from @/data/articles.
 *
 * Key mapping: categoryId = categories.slug so getCategoryById() finds
 * the right static category metadata (colours, name, icon).
 *
 * Author data is now embedded directly in the Article so client components
 * don't need to call getAuthorById() from the (now empty) static authors array.
 */
export function toArticle(a: PublicArticle, index = 0): Article {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    deck: a.excerpt ?? '',
    excerpt: a.excerpt ?? '',
    // Use the category SLUG so getCategoryById() matches static metadata
    categoryId: a.categories?.slug ?? a.category_id ?? '',
    // Author slug kept for backwards compat
    authorId: a.authors?.slug ?? '',
    // Embed author display data directly from DB join — no static lookup needed
    authorName: a.authors?.name ?? undefined,
    authorAvatar: a.authors?.avatar ?? undefined,
    authorRole: a.authors?.role ?? undefined,
    tags: a.tags ?? [],
    featuredImage:
      a.cover_image ??
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
    publishedAt: a.published_at ?? new Date().toISOString(),
    updatedAt: a.published_at ?? new Date().toISOString(),
    readTimeMinutes: a.read_time_minutes ?? 5,
    contentLevel: 'beginner',
    featured: index === 0,
  };
}
