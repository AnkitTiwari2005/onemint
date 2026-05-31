import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'DB not configured', categories: [], degraded: true }, { status: 503 });
    }
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*, articles(count)')
      .is('deleted_at', null)
      .order('name', { ascending: true });
    if (error) {
      console.error('[Admin categories GET]', error.message);
      return NextResponse.json({ error: 'Database error', categories: [], degraded: true }, { status: 500 });
    }
    // Normalize: flatten nested article count + snake_case accent_color
    const normalized = (data ?? []).map((c) => ({
      ...c,
      accentColor: c.accent_color || '#1B6B3A',
      articleCount: Array.isArray(c.articles) ? (c.articles[0]?.count ?? 0) : 0,
    }));
    return NextResponse.json(normalized);
  } catch (err) {
    console.error('[Admin categories GET] Unexpected:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('categories').insert([{
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: body.description || '',
      accent_color: body.accentColor || body.accent_color || '#1B6B3A',
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin categories POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('categories').update({
      name: body.name, slug: body.slug,
      description: body.description || '',
      accent_color: body.accentColor || body.accent_color,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin categories PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('categories').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin categories DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
