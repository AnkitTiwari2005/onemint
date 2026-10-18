import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/articles/view?slug=xxx
 * Increments view count for an article using an atomic DB function.
 * Called client-side on article page mount.
 * Rate-limited per IP+slug (10 min window) to prevent inflation.
 *
 * GET /api/articles/view?slug=xxx
 * Returns current view count for an article.
 */

// In-memory rate limit map: "slug:ip" → timestamp of last counted view
// Resets on cold start — acceptable for a soft view-count limit.
const viewRateLimit = new Map<string, number>();
const VIEW_RATE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // IP-based rate limit — one view per article per IP per 10 minutes
  // Prefer x-real-ip (set by the terminating reverse proxy — not spoofable by clients).
  // Fall back to the rightmost XFF entry (last hop added by a trusted proxy).
  // Never use XFF[0] — that is client-controlled and trivially spoofable.
  const realIp = req.headers.get('x-real-ip');
  const xffHeader = req.headers.get('x-forwarded-for') ?? '';
  const xffLast = xffHeader.split(',').pop()?.trim() ?? '';
  const clientIp = (realIp ?? (xffLast || 'unknown')).trim();
  const rateLimitKey = `${slug}:${clientIp}`;
  const lastSeen = viewRateLimit.get(rateLimitKey);
  if (lastSeen && Date.now() - lastSeen < VIEW_RATE_LIMIT_MS) {
    return NextResponse.json({ ok: true, reason: 'rate-limited' });
  }
  viewRateLimit.set(rateLimitKey, Date.now());

  // Prune stale entries to prevent unbounded memory growth
  if (viewRateLimit.size > 2000) {
    const cutoff = Date.now() - VIEW_RATE_LIMIT_MS;
    for (const [k, t] of viewRateLimit.entries()) {
      if (t < cutoff) viewRateLimit.delete(k);
    }
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
