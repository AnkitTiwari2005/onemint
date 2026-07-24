import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

/** Build a pseudonymous fingerprint from IP + User-Agent (no PII stored). */
function buildFingerprint(req: NextRequest): string {
  const ip = getClientIP(req);
  const ua = req.headers.get('user-agent') || '';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleSlug = searchParams.get('slug');
    if (!articleSlug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    if (!supabaseAdmin) {
      return NextResponse.json({ liked: false, count: 0, source: 'unavailable' });
    }

    const fingerprint = buildFingerprint(req);

    const [likeRes, countRes] = await Promise.all([
      supabaseAdmin
        .from('article_likes')
        .select('id')
        .eq('article_slug', articleSlug)
        .eq('user_fingerprint', fingerprint)
        .maybeSingle(),
      supabaseAdmin
        .from('article_likes')
        .select('id', { count: 'exact', head: true })
        .eq('article_slug', articleSlug),
    ]);

    if (likeRes.error) {
      console.error('[Likes GET] like check error:', likeRes.error.message);
      return NextResponse.json({ liked: false, count: 0 });
    }

    const res = NextResponse.json({ liked: !!likeRes.data, count: countRes.count ?? 0 });
    res.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    return res;
  } catch (err) {
    console.error('[Likes GET]', err);
    return NextResponse.json({ liked: false, count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, vote = 'up' } = body as { slug: string; vote?: 'up' | 'down' };
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const fingerprint = buildFingerprint(req);

    // Rate limit: max 20 vote-toggles per fingerprint per hour
    const { limited } = rateLimit(fingerprint, 'likes', 20, 60 * 60 * 1000);
    if (limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // ── Downvote path ─────────────────────────────────────────────────────────
    if (vote === 'down') {
      // Record dislike (upsert — one per fingerprint per article, non-reversible)
      await supabaseAdmin
        .from('article_dislikes')
        .upsert([{ article_slug: slug, user_fingerprint: fingerprint }], {
          onConflict: 'article_slug,user_fingerprint',
          ignoreDuplicates: true,
        });

      const { count } = await supabaseAdmin
        .from('article_likes')
        .select('id', { count: 'exact', head: true })
        .eq('article_slug', slug);

      return NextResponse.json({ success: true, liked: false, count: count ?? 0 });
    }

    // ── Upvote path (toggle) ──────────────────────────────────────────────────
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from('article_likes')
      .select('id')
      .eq('article_slug', slug)
      .eq('user_fingerprint', fingerprint)
      .maybeSingle();

    if (selectErr) {
      console.error('[Likes POST] select error:', selectErr.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existing) {
      const { error: delErr } = await supabaseAdmin
        .from('article_likes')
        .delete()
        .eq('article_slug', slug)
        .eq('user_fingerprint', fingerprint);
      if (delErr) {
        console.error('[Likes POST] delete error:', delErr.message);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabaseAdmin
        .from('article_likes')
        .insert([{ article_slug: slug, user_fingerprint: fingerprint }]);
      if (insErr) {
        console.error('[Likes POST] insert error:', insErr.message);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    const { count, error: countErr } = await supabaseAdmin
      .from('article_likes')
      .select('id', { count: 'exact', head: true })
      .eq('article_slug', slug);

    if (countErr) {
      console.error('[Likes POST] count error:', countErr.message);
    }

    return NextResponse.json({ success: true, liked: !existing, count: count ?? 0 });
  } catch (err) {
    console.error('[Likes POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

