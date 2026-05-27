/**
 * Shared in-memory rate limiter.
 * Resets on serverless cold-start — good enough for basic abuse protection.
 * Usage: rateLimit(ip, 'contact', 5, 10 * 60 * 1000) → max 5 per 10 min
 */
const store = new Map<string, { count: number; resetAt: number }>();

/** Evict all expired entries when the store grows large (lazy GC). */
function maybePrune(now: number) {
  if (store.size < 5_000) return;
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}

export function rateLimit(
  ip: string,
  namespace: string,
  max: number,
  windowMs: number
): { limited: boolean; retryAfterSec: number } {
  const id = `${namespace}:${ip}`;
  const now = Date.now();

  maybePrune(now);

  const entry = store.get(id);

  if (!entry || now > entry.resetAt) {
    store.set(id, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSec: 0 };
  }

  entry.count++;
  if (entry.count > max) {
    return { limited: true, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfterSec: 0 };
}

/** Extract the best available IP from request headers */
export function getClientIP(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
