import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';
import { getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';

export const dynamic = 'force-dynamic';

export async function GET() {
  // ── Try Supabase ───────────────────────────────────────────────────────
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        id, title, slug, excerpt, cover_image,
        category_id, tags, read_time_minutes,
        status, published_at, created_at,
        categories(id, name, slug),
        authors(id, name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ articles: data, source: 'db', degraded: false });
    }
    if (error) {
      console.error('[Public articles GET] DB error:', error.message);
    } else {
      console.warn('[Public articles GET] DB returned 0 published articles — falling back to static');
    }
  }

  // ── Static fallback ────────────────────────────────────────────────────
  const fallback = staticArticles.map((a) => {
    const cat = getCategoryById(a.categoryId);
    const auth = getAuthorById(a.authorId);
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      cover_image: a.featuredImage,
      category_id: a.categoryId,
      tags: a.tags,
      read_time_minutes: a.readTimeMinutes,
      status: 'published',
      published_at: a.publishedAt,
      created_at: a.publishedAt,
      categories: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      authors: auth ? { id: auth.id, name: auth.name, slug: auth.slug } : null,
    };
  });

  return NextResponse.json({ articles: fallback, source: 'static', degraded: true });
}
