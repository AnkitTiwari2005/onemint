import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchPublishedArticles } from '@/lib/articles';

/**
 * GET /api/trending
 * Returns top articles by like count, falling back to most recent if no likes data.
 * Cached for 5 minutes — trending doesn't need real-time accuracy.
 */
export const revalidate = 300; // 5-minute ISR cache

export async function GET() {
  try {
    let articles: Array<{
      slug: string;
      title: string;
      cover_image?: string | null;
      published_at?: string | null;
      read_time_minutes?: number | null;
      like_count?: number;
      categoryName?: string | null;
      categoryAccent?: string | null;
    }> = [];

    if (supabaseAdmin) {
      // Get like counts per article
      const { data: likeCounts } = await supabaseAdmin
        .from('article_likes')
        .select('article_slug')
        .then(({ data }) => {
          // Count per slug
          const counts: Record<string, number> = {};
          (data ?? []).forEach((row: { article_slug: string }) => {
            counts[row.article_slug] = (counts[row.article_slug] ?? 0) + 1;
          });
          return { data: counts };
        });

      // Fetch published articles with category data
      const { data: rawArticles } = await supabaseAdmin
        .from('articles')
        .select('slug, title, cover_image, published_at, read_time_minutes, categories(name, accent_color)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      if (rawArticles) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        articles = (rawArticles as any[])
          .map((a) => {
            // Supabase returns joined relation as array even for many-to-one
            const cat = Array.isArray(a.categories) ? a.categories[0] : a.categories;
            return {
              slug: a.slug as string,
              title: a.title as string,
              cover_image: a.cover_image as string | null,
              published_at: a.published_at as string | null,
              read_time_minutes: a.read_time_minutes as number | null,
              like_count: (likeCounts as Record<string, number>)?.[a.slug] ?? 0,
              categoryName: cat?.name ?? null,
              categoryAccent: cat?.accent_color ?? null,
            };
          })
          .sort((a, b) => {
            // Primary: like count descending
            const likesDiff = (b.like_count ?? 0) - (a.like_count ?? 0);
            if (likesDiff !== 0) return likesDiff;
            // Secondary: most recent
            return (b.published_at ?? '').localeCompare(a.published_at ?? '');
          })
          .slice(0, 10);
      }
    } else {
      // Static fallback — just return most recent
      const { articles: staticArticles } = await fetchPublishedArticles();
      articles = staticArticles.slice(0, 10).map(a => ({
        slug: a.slug,
        title: a.title,
        cover_image: a.cover_image,
        published_at: a.published_at,
        read_time_minutes: a.read_time_minutes,
        like_count: 0,
        categoryName: a.categories?.name ?? null,
        categoryAccent: a.categories?.accent_color ?? null,
      }));
    }

    const res = NextResponse.json({ articles });
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (err) {
    console.error('[Trending API]', err);
    return NextResponse.json({ articles: [] });
  }
}
