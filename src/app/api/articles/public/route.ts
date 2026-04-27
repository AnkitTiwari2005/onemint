import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(staticArticles);
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
    if (error) {
      console.error('[Public articles GET]', error.message);
      return NextResponse.json(staticArticles);
    }
    return NextResponse.json(data?.length ? data : staticArticles);
  } catch (err) {
    console.error('[Public articles GET] Unexpected:', err);
    return NextResponse.json(staticArticles);
  }
}
