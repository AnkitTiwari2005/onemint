import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/feedback
 * Stores article dislike reasons for editorial insight.
 * Body: { slug: string, reason: string }
 * Table: article_feedback_reasons (slug, reason, created_at)
 */
export async function POST(req: NextRequest) {
  try {
    const { slug, reason } = await req.json();
    if (!slug || !reason) return NextResponse.json({ ok: false }, { status: 400 });

    if (supabaseAdmin) {
      await supabaseAdmin.from('article_feedback_reasons').insert({
        article_slug: slug,
        reason: String(reason).slice(0, 120),
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
