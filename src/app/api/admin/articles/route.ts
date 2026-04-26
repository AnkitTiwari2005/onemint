import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ENV } from '@/lib/env';

// GET /api/admin/articles — list all articles for admin
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`id, title, slug, status, published_at, created_at, category_id, author_id, categories(name), authors(name)`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('[Admin articles GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/articles — create new article
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const isPublished = body.status === 'published';

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert([{
        title: body.title.trim(),
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        excerpt: body.excerpt || '',
        content: body.content || '',
        cover_image: body.cover_image || '',
        category_id: body.category_id || null,
        author_id: body.author_id || null,
        tags: body.tags || [],
        read_time_minutes: body.read_time_minutes || 5,
        status: body.status || 'draft',
        meta_title: body.meta_title || '',
        meta_description: body.meta_description || '',
        published_at: isPublished ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger Typesense sync non-blocking when publishing
    if (isPublished && data?.id && ENV.SITE_URL) {
      fetch(`${ENV.SITE_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: data.id }),
      }).catch((err) => console.error('[Sync trigger POST]', err));
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin articles POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
