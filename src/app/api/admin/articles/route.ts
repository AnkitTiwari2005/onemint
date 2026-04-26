import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
    console.error('Admin articles GET error:', err);
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

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert([{
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || '',
        content: body.content || '',
        cover_image: body.cover_image || '',
        category_id: body.category_id || null,
        author_id: body.author_id || null,
        tags: body.tags || [],
        read_time_minutes: body.read_time_minutes || 5,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Admin articles POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
