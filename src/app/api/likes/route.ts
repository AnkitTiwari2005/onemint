import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

function getFingerprint(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleSlug = searchParams.get('slug');
    if (!articleSlug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    if (!supabaseAdmin) return NextResponse.json({ liked: false, count: 0 });

    const fingerprint = getFingerprint(req);
    const [likeRes, countRes] = await Promise.all([
      supabaseAdmin.from('article_likes').select('id')
        .eq('article_slug', articleSlug).eq('user_fingerprint', fingerprint).maybeSingle(),
      supabaseAdmin.from('article_likes').select('id', { count: 'exact', head: true })
        .eq('article_slug', articleSlug),
    ]);

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
    if (!supabaseAdmin) return NextResponse.json({ success: false, liked: false, count: 0 });

    const fingerprint = getFingerprint(req);

    const { data: existing } = await supabaseAdmin.from('article_likes').select('id')
      .eq('article_slug', slug).eq('user_fingerprint', fingerprint).maybeSingle();

    if (existing) {
      await supabaseAdmin.from('article_likes').delete()
        .eq('article_slug', slug).eq('user_fingerprint', fingerprint);
    } else {
      await supabaseAdmin.from('article_likes').insert([{ article_slug: slug, user_fingerprint: fingerprint }]);
    }

    const { count } = await supabaseAdmin.from('article_likes')
      .select('id', { count: 'exact', head: true }).eq('article_slug', slug);

    return NextResponse.json({ success: true, liked: !existing, count: count ?? 0 });
  } catch (err) {
    console.error('[Likes POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
