/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Works on Vercel serverless — limits per-instance (not globally),
 * which is fine for blocking spam bursts from a single IP.
 *
 * For global rate limiting at scale, swap this for Upstash Redis.
 *
 * Usage:
 *   const limited = rateLimit(req, { max: 5, windowMs: 60_000 });
 *   if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface Entry {
  count: number;
  resetAt: number;
}

// Map from key → { count, resetAt }
// Each Vercel function instance keeps its own map — this is intentional.
const store = new Map<string, Entry>();

// Prune old entries every 10 minutes to prevent unbounded memory growth
const PRUNE_INTERVAL = 10 * 60 * 1000;
let lastPrune = Date.now();

function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL) return;
  lastPrune = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

interface Options {
  /** Maximum number of requests allowed in the window. Default: 10 */
  max?: number;
  /** Time window in milliseconds. Default: 60,000 (1 minute) */
  windowMs?: number;
  /** Key prefix to namespace limits (e.g. 'comment', 'newsletter'). Default: 'req' */
  prefix?: string;
}

/**
 * Returns true if the request is rate-limited (should return 429).
 * Returns false if the request is allowed.
 */
export function rateLimit(
  req: { headers: { get(name: string): string | null } },
  { max = 10, windowMs = 60_000, prefix = 'req' }: Options = {}
): boolean {
  pruneIfNeeded();

  // Extract IP from standard Vercel headers
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';

  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false; // allowed
  }

  existing.count += 1;
  if (existing.count > max) {
    return true; // rate limited
  }

  return false; // allowed
}
