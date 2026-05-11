import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';
import { categories as staticCategories, getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';
import ArticlesClientShell, { PublicArticle } from './ArticlesClientShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Articles | OneMint',
  description: 'In-depth guides across finance, technology, health, career, and more — from OneMint.',
};

export default async function ArticlesPage() {
  let articles: PublicArticle[] = [];
  let degraded = false;

  // ── Try fetching published articles from Supabase ──────────────────────
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        id, title, slug, excerpt, cover_image,
        category_id, tags, read_time_minutes,
        published_at,
        categories(id, name, slug, accent_color, light_color),
        authors(id, name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('[Articles page] DB fetch failed:', error.message);
      degraded = true;
    } else if (data && data.length > 0) {
      articles = data as unknown as PublicArticle[];
    } else {
      // DB connected but empty — fall back to static seed data
      degraded = true;
    }
  } else {
    degraded = true;
  }

  // ── Fallback to static seed data ───────────────────────────────────────
  if (degraded) {
    console.warn('[Articles page] Falling back to static article data');
    articles = staticArticles.map((a) => {
      const cat = getCategoryById(a.categoryId);
      const author = getAuthorById(a.authorId);
      return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        cover_image: a.featuredImage,
        category_id: a.categoryId,
        tags: a.tags,
        read_time_minutes: a.readTimeMinutes,
        published_at: a.publishedAt,
        categories: cat
          ? {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              accent_color: cat.accentColor,
              light_color: cat.lightColor,
            }
          : null,
        authors: author
          ? { id: author.id, name: author.name, slug: author.slug }
          : null,
      };
    });
  }

  return (
    <ArticlesClientShell
      articles={articles}
      totalCount={articles.length}
      degraded={degraded}
    />
  );
}
