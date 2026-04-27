import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { glossaryTerms } from '@/data/glossary';

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(glossaryTerms);
    const { data, error } = await supabaseAdmin
      .from('glossary_terms').select('*').order('term', { ascending: true });
    if (error || !data?.length) return NextResponse.json(glossaryTerms);
    return NextResponse.json(data);
  } catch { return NextResponse.json(glossaryTerms); }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.term?.trim()) return NextResponse.json({ error: 'Term required' }, { status: 400 });
    const slug = body.slug || body.term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabaseAdmin.from('glossary_terms').insert([{
      term: body.term.trim(), slug,
      short_definition: body.shortDefinition || body.short_definition || '',
      full_definition: body.fullDefinition || body.full_definition || '',
      category: body.category || '',
      example: body.example || '',
      related_terms: body.relatedTerms || body.related_terms || [],
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Admin glossary POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('glossary_terms').update({
      term: body.term,
      short_definition: body.shortDefinition || body.short_definition,
      full_definition: body.fullDefinition || body.full_definition,
      category: body.category,
      example: body.example,
      related_terms: body.relatedTerms || body.related_terms || [],
      updated_at: new Date().toISOString(),
    }).eq('id', body.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin glossary PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('glossary_terms').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin glossary DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
