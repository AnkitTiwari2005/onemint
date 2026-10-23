import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/track
 *
 * Cookieless, PII-free first-party page-view counter.
 *
 * Privacy contract:
 *  - No cookies created or read.
 *  - No localStorage used.
 *  - Raw IP and User-Agent are NEVER stored.
 *  - Unique visitors are estimated via a daily-rotating HMAC:
 *      HMAC-SHA256(IP + UA + ANALYTICS_SALT_SECRET + UTC-date)
 *    The salt changes daily, making cross-day re-identification impossible.
 *    Only the count is persisted — the hash itself is never written.
 *  - Referrer is coarsened to origin domain only (no paths, no query strings).
 *  - Requests with DNT: 1 or Sec-GPC: 1 are silently dropped (no tracking).
 *  - Bot requests (identified via UA) are silently dropped.
 *  - Admin paths (/admin) are never tracked.
 *
 * ANALYTICS_SALT_SECRET env var:
 *  Required for unique-visitor hashing. If missing, unique_vis is not
 *  incremented (views still count). Add to .env.local and Hostinger env vars.
 *
 * Returns 204 No Content on success (no body — works with navigator.sendBeacon).
 */

// ── Bot detection ─────────────────────────────────────────────────────────────
const BOT_UA_RE =
  /bot|crawl|spider|scrape|preview|headless|lighthouse|pingdom|uptimerobot|pagespeed|gtmetrix|semrush|ahref|majestic|mj12bot|yandex|baiduspider|sogou|exabot|facebot|ia_archiver/i;

function isBot(ua: string): boolean {
  return BOT_UA_RE.test(ua);
}

// ── Device classification ─────────────────────────────────────────────────────
function classifyDevice(ua: string): 'mobile' | 'tablet' | 'desktop' | 'bot' {
  if (isBot(ua)) return 'bot';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|windows phone|blackberry/i.test(ua)) return 'mobile';
  return 'desktop';
}

// ── Referrer coarsening ───────────────────────────────────────────────────────
function coarsenReferrer(referrer: string): string {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    // Strip "www." prefix for cleaner grouping
    const hostname = url.hostname.replace(/^www\./, '');
    // Drop referrers from our own domain
    if (hostname === 'onemint.com') return 'internal';
    return hostname || 'direct';
  } catch {
    return 'direct';
  }
}

// ── Path normalisation ────────────────────────────────────────────────────────
function normalisePath(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    // Strip query string and fragment — only keep the path
    const url = new URL(raw, 'https://www.onemint.com');
    const p = url.pathname
      // Remove trailing slash (except root)
      .replace(/\/$/, '') || '/';
    // Reject admin paths
    if (p.startsWith('/admin')) return null;
    // Reject obviously invalid paths
    if (p.length > 500) return null;
    return p;
  } catch {
    return null;
  }
}

// ── Daily unique-visitor hash ─────────────────────────────────────────────────
function computeVisitorHash(ip: string, ua: string, salt: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  return createHmac('sha256', salt)
    .update(`${ip}|${ua}|${today}`)
    .digest('hex');
}

// ── In-memory seen-today set for deduplication ────────────────────────────────
// This map holds (hash → date) so we don't write unique_vis=1 multiple times
// for the same visitor on the same day within the same server instance.
// It resets on cold start — that's fine; we just count unique_vis optimistically.
// The map is pruned to prevent unbounded growth.
const seenToday = new Map<string, string>(); // hash → UTC date
const MAX_SEEN = 10_000;

function hasSeenToday(hash: string, date: string): boolean {
  return seenToday.get(hash) === date;
}
function markSeen(hash: string, date: string): void {
  seenToday.set(hash, date);
  if (seenToday.size > MAX_SEEN) {
    // Prune oldest entries (first 20% of the map)
    const toDelete = Math.floor(MAX_SEEN * 0.2);
    let count = 0;
    for (const k of seenToday.keys()) {
      seenToday.delete(k);
      if (++count >= toDelete) break;
    }
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Privacy signals — honour Do Not Track / Global Privacy Control ──────
  if (req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1') {
    return new NextResponse(null, { status: 204 });
  }

  // ── 2. Bot check ───────────────────────────────────────────────────────────
  const ua = req.headers.get('user-agent') ?? '';
  const device = classifyDevice(ua);
  if (device === 'bot') {
    return new NextResponse(null, { status: 204 });
  }

  // ── 3. Parse body ──────────────────────────────────────────────────────────
  let body: { page?: unknown; referrer?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  // ── 4. Normalise path ──────────────────────────────────────────────────────
  const page = normalisePath(String(body.page ?? ''));
  if (!page) return new NextResponse(null, { status: 204 });

  // ── 5. Coarsen referrer ────────────────────────────────────────────────────
  const referrer = coarsenReferrer(String(body.referrer ?? ''));

  // ── 6. Skip if Supabase not configured ────────────────────────────────────
  if (!supabaseAdmin) return new NextResponse(null, { status: 204 });

  // ── 7. Compute unique-visitor signal ──────────────────────────────────────
  const salt = process.env.ANALYTICS_SALT_SECRET ?? '';
  const today = new Date().toISOString().slice(0, 10);
  let isUniqueToday = false;

  if (salt) {
    // Prefer x-real-ip (set by trusted reverse proxy), fall back to rightmost XFF
    const realIp = req.headers.get('x-real-ip') ?? '';
    const xff = req.headers.get('x-forwarded-for') ?? '';
    const ip = (realIp || xff.split(',').pop()?.trim() || 'unknown').trim();

    const hash = computeVisitorHash(ip, ua, salt);
    isUniqueToday = !hasSeenToday(hash, today);
    if (isUniqueToday) markSeen(hash, today);
  }

  // ── 8. Upsert into analytics_daily ────────────────────────────────────────
  try {
    await supabaseAdmin.rpc('upsert_analytics_daily', {
      p_date: today,
      p_page: page,
      p_referrer: referrer,
      p_device: device,
      p_is_unique: isUniqueToday,
    });
  } catch {
    // Non-critical — never expose errors to client; beacon responses are ignored anyway
  }

  return new NextResponse(null, { status: 204 });
}
