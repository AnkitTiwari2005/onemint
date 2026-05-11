import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// Simple in-memory rate limit: max 20 like-toggles per fingerprint per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getFingerprint(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32);
}

function checkRateLimit(fingerprint: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(fingerprint);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(fingerprint, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= RATE_LIMIT) return false; // blocked
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleSlug = searchParams.get('slug');
    if (!articleSlug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    if (!supabaseAdmin) {
      return NextResponse.json({ liked: false, count: 0, source: 'unavailable' });
    }

    const fingerprint = getFingerprint(req);
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

    return NextResponse.json({ liked: !!likeRes.data, count: countRes.count ?? 0 });
  } catch (err) {
    console.error('[Likes GET]', err);
    return NextResponse.json({ liked: false, count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const fingerprint = getFingerprint(req);

    // Rate limit check
    if (!checkRateLimit(fingerprint)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
