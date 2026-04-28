import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

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
    const { error: insertError } = await supabaseAdmin
      .from('suggestion_votes')
      .insert({ suggestion_id: suggestionId, user_fingerprint: fingerprint });

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ success: false, alreadyVoted: true });
      }
      console.error('[Vote] Insert error:', insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Fire-and-forget: increment vote count via RPC
    const response = NextResponse.json({ success: true });

    void Promise.resolve(
      supabaseAdmin.rpc('increment_votes', { suggestion_id_param: suggestionId })
    ).then(({ error }) => {
      if (error) console.error('[Vote] RPC increment_votes failed:', error.message);
    }).catch((err: unknown) => console.error('[Vote] RPC exception:', err));

    return response;
  } catch (err) {
    console.error('[Vote] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
