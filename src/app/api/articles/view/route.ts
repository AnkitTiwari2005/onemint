import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/articles/view?slug=xxx
 * Increments view count for an article using an atomic DB function.
 * Called client-side on article page mount (once per page load).
 * No auth required — bots are partially filtered by checking Referer.
 *
 * GET /api/articles/view?slug=xxx
 * Returns current view count for an article.
 */

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // Lightweight bot filter: require a Referer header (browsers always send it)
  const referer = req.headers.get('referer') ?? '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
  if (!referer.includes('onemint.in') && !referer.includes('localhost')) {
    return NextResponse.json({ ok: false, reason: 'bot' });
  }

  if (!supabaseAdmin) return NextResponse.json({ ok: true });

  try {
    await supabaseAdmin.rpc('increment_view_count', { p_slug: slug });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Non-critical — don't surface errors to the client
    console.warn('[view-count]', err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ count: 0 });
  if (!supabaseAdmin) return NextResponse.json({ count: 0 });

  try {
    const { data } = await supabaseAdmin
      .from('article_views')
      .select('count')
      .eq('slug', slug)
      .maybeSingle();

    const res = NextResponse.json({ count: data?.count ?? 0 });
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
