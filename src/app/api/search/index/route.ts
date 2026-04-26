import { NextResponse } from 'next/server';
import { typesenseAdmin } from '@/lib/typesense';
import { supabaseAdmin } from '@/lib/supabase';

// Collection schema — defined once, reused for create + index
const SCHEMA = {
  name: 'articles',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'excerpt', type: 'string' as const },
    { name: 'slug', type: 'string' as const },
    { name: 'categoryId', type: 'string' as const },
    { name: 'categoryName', type: 'string' as const },
    { name: 'authorName', type: 'string' as const },
    { name: 'tags', type: 'string[]' as const },
    { name: 'publishedAt', type: 'string' as const },
    { name: 'readTimeMinutes', type: 'int32' as const },
  ],
};

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    // Fetch published articles from Supabase (not static data)
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        id, title, excerpt, slug, category_id, tags,
        read_time_minutes, published_at, created_at,
        categories(name), authors(name)
      `)
      .eq('status', 'published');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Drop + recreate for a clean index
    try {
      await typesenseAdmin.collections('articles').delete();
    } catch {
      // Collection may not exist yet — that's fine
    }
    await typesenseAdmin.collections().create(SCHEMA);

    const docs = (data || []).map((a) => ({
      id: String(a.id),
      title: a.title || '',
      excerpt: a.excerpt || '',
      slug: a.slug || '',
      categoryId: String(a.category_id || ''),
      categoryName: (a.categories as { name?: string } | null)?.name || '',
      authorName: (a.authors as { name?: string } | null)?.name || '',
      tags: Array.isArray(a.tags) ? a.tags : [],
      publishedAt: a.published_at || a.created_at || '',
      readTimeMinutes: Number(a.read_time_minutes || 5),
    }));

    if (docs.length > 0) {
      await typesenseAdmin
        .collections('articles')
        .documents()
        .import(docs, { action: 'upsert' });
    }

    return NextResponse.json({ success: true, indexed: docs.length });
  } catch (err) {
    console.error('[Typesense index]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
