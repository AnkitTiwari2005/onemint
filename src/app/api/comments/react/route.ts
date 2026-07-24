import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

const VALID_EMOJIS = ['👍', '❤️', '🔥', '💡', '😂'];

/** Derive a stable, anonymised fingerprint from IP + User-Agent. */
function getFingerprint(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 40);
}

/**
 * POST /api/comments/react
 * Toggles an emoji reaction on a comment.
 * Body: { comment_id: string, emoji: string }
 * Response: { reacted: boolean, count: number }
 */
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  try {
    const { comment_id, emoji } = await req.json();

    if (!comment_id || typeof comment_id !== 'string')
      return NextResponse.json({ error: 'comment_id required' }, { status: 400 });
    if (!emoji || !VALID_EMOJIS.includes(emoji))
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });

    // Verify comment exists and is approved
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('id')
      .eq('id', comment_id)
      .eq('status', 'approved')
      .maybeSingle();

    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    const fingerprint = getFingerprint(req);

    // Try to insert; if unique constraint fires → already reacted → delete instead (toggle off)
    const { error: insertError } = await supabaseAdmin
      .from('comment_reactions')
      .insert({ comment_id, emoji, fingerprint });

    let reacted: boolean;

    if (insertError) {
      if (insertError.code === '23505') {
        // Duplicate → toggle off
        await supabaseAdmin
          .from('comment_reactions')
          .delete()
          .eq('comment_id', comment_id)
          .eq('emoji', emoji)
          .eq('fingerprint', fingerprint);
        reacted = false;
      } else {
        throw insertError;
      }
    } else {
      reacted = true;
    }

    // Return fresh count
    const { count } = await supabaseAdmin
      .from('comment_reactions')
      .select('id', { count: 'exact', head: true })
      .eq('comment_id', comment_id)
      .eq('emoji', emoji);

    return NextResponse.json({ reacted, count: count ?? 0 });
  } catch (err) {
    console.error('[React] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
