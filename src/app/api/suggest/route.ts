import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { title, category } = await req.json();

    if (!title?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Title and category required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('topic_suggestions')
      .insert([{ 
        title: title.trim(), 
        category: category.trim(), 
        votes: 0, 
        status: 'requested' 
      }])
      .select()
      .single();

    if (error) {
      console.error('[Suggest] Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Suggest] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
