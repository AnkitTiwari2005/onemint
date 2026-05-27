import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 5 suggestions per 10 minutes per IP
  const { limited, retryAfterSec } = rateLimit(getClientIP(req), 'suggest', 5, 10 * 60 * 1000);
  if (limited) {
    return NextResponse.json(
      { error: `Too many submissions. Try again in ${retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    );
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { title, category } = await req.json();

    if (!title?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Title and category required' }, { status: 400 });
    }
    if (title.trim().length > 300) {
      return NextResponse.json({ error: 'Title too long (max 300 chars)' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('topic_suggestions')
      .insert([{
        title: title.trim(),
        category: category.trim(),
        votes: 0,
        status: 'requested',
      }])
      .select()
      .single();

    if (error) {
      console.error('[Suggest] Insert error:', error.message);
      return NextResponse.json({ error: 'Failed to save suggestion. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[Suggest] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
