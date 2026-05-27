import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([]);
    const { data, error } = await supabaseAdmin
      .from('series').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[Admin series GET]', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('series').insert([{
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description || '',
      cover_image: body.coverImage || body.cover_image || '',
      category_id: body.categoryId || body.category_id || null,
      article_slugs: body.articleSlugs || body.article_slugs || [],
      total_read_time: body.totalReadTime || body.total_read_time || 0,
      status: body.status || 'active',
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin series POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('series').update({
      name: body.name, slug: body.slug,
      description: body.description,
      cover_image: body.coverImage || body.cover_image,
      category_id: body.categoryId || body.category_id,
      article_slugs: body.articleSlugs || body.article_slugs || [],
      total_read_time: body.totalReadTime || body.total_read_time || 0,
      status: body.status,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin series PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('series').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin series DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
