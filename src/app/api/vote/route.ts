import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { suggestionId } = await req.json();

    if (!suggestionId) {
      return NextResponse.json({ error: 'suggestionId required' }, { status: 400 });
    }

    // Use IP + user-agent as anonymous fingerprint
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const ua = req.headers.get('user-agent') || '';
    const raw = `${ip}-${ua}-${suggestionId}`;
    const fingerprint = Buffer.from(raw).toString('base64').slice(0, 64);

    // Insert vote — UNIQUE(suggestion_id, user_fingerprint) prevents double voting
    const { error } = await supabase
      .from('topic_votes')
      .insert({ suggestion_id: suggestionId, user_fingerprint: fingerprint });

    if (error) {
      if (error.code === '23505') {
        // Duplicate vote
        return NextResponse.json({ success: false, alreadyVoted: true });
      }
      console.error('Vote insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment vote count on the suggestion row
    await supabase.rpc('increment_votes', { suggestion_id_param: suggestionId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Vote route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
