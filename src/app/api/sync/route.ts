import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { typesenseAdmin } from '@/lib/typesense';

// Sync a single article document into Typesense
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`*, categories(name), authors(name)`)
      .eq('id', articleId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Article not found' }, { status: 404 });
    }

    // Shape for Typesense
    const doc = {
      id: String(data.id),
      title: data.title || '',
      excerpt: data.excerpt || '',
      slug: data.slug || '',
      categoryId: String(data.category_id || ''),
      categoryName: (data.categories as { name?: string } | null)?.name || '',
      authorName: (data.authors as { name?: string } | null)?.name || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      readTimeMinutes: Number(data.read_time_minutes || 5),
      publishedAt: data.published_at || data.created_at || '',
    };

    await typesenseAdmin.collections('articles').documents().upsert(doc);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Typesense sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

// Bulk-sync all published articles into Typesense
export async function PUT() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`id, title, excerpt, slug, category_id, tags, read_time_minutes, published_at, created_at, categories(name), authors(name)`)
      .eq('status', 'published');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const docs = (data || []).map((a) => ({
      id: String(a.id),
      title: a.title || '',
      excerpt: a.excerpt || '',
      slug: a.slug || '',
      categoryId: String(a.category_id || ''),
      categoryName: (a.categories as { name?: string } | null)?.name || '',
      authorName: (a.authors as { name?: string } | null)?.name || '',
      tags: Array.isArray(a.tags) ? a.tags : [],
      readTimeMinutes: Number(a.read_time_minutes || 5),
      publishedAt: a.published_at || a.created_at || '',
    }));

    if (docs.length > 0) {
      await typesenseAdmin.collections('articles').documents().import(docs, { action: 'upsert' });
    }

    return NextResponse.json({ success: true, count: docs.length });
  } catch (err) {
    console.error('Typesense bulk sync error:', err);
    return NextResponse.json({ error: 'Bulk sync failed' }, { status: 500 });
  }
}
