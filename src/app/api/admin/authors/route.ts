import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([], { status: 503 });
    const { data, error } = await supabaseAdmin
      .from('authors').select('*').order('name', { ascending: true });
    if (error) {
      console.error('[Admin authors GET]', error.message);
      return NextResponse.json([], { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[Admin authors GET] Unexpected:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('authors').insert([{
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      email: body.email || null,
      role: body.role || 'Contributor',
      bio: body.bio || '',
      avatar: body.avatar || '',
      twitter: body.twitter || '',
      linkedin: body.linkedin || '',
      website: body.website || '',
      status: body.status || 'active',
      joined_date: body.joinedDate || body.joined_date || null,
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin authors POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('authors').update({
      name: body.name, slug: body.slug, email: body.email,
      role: body.role, bio: body.bio, avatar: body.avatar,
      twitter: body.twitter, linkedin: body.linkedin, website: body.website,
      status: body.status,
      joined_date: body.joinedDate || body.joined_date,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin authors PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('authors').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin authors DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
