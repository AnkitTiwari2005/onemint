/**
 * Shared article fetching helpers — used by both API routes and server components.
 * Single source of truth so DB logic isn't duplicated.
 */

import { supabaseAdmin } from './supabase';
import { articles as staticArticles } from '@/data/articles';
import { getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';

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
  const auth = getAuthorById(a.authorId);
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
    categories: cat
      ? { id: cat.id, name: cat.name, slug: cat.slug, accent_color: cat.accentColor, light_color: cat.lightColor }
      : null,
    authors: auth
      ? { id: auth.id, name: auth.name, slug: auth.slug, bio: auth.bio, avatar: auth.avatar, role: auth.role }
      : null,
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
        .select(`
          id, title, slug, excerpt, content, cover_image,
          category_id, tags, read_time_minutes, published_at,
          meta_title, meta_description,
          categories(id, name, slug, accent_color, light_color),
          authors(id, name, slug, bio, avatar, role)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false });

      if (!error && data && data.length > 0) {
        return {
          articles: data as unknown as PublicArticle[],
          source: 'db',
          degraded: false,
        };
      }
      if (error) {
        console.error('[fetchPublishedArticles] DB error:', error.message);
      } else {
        console.warn('[fetchPublishedArticles] DB returned 0 published articles');
      }
    } catch (err) {
      console.error('[fetchPublishedArticles] Unexpected:', err);
    }
  }

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
        .select(`
          id, title, slug, excerpt, content, cover_image,
          category_id, tags, read_time_minutes, published_at,
          meta_title, meta_description,
          categories(id, name, slug, accent_color, light_color),
          authors(id, name, slug, bio, avatar, role)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
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
