/**
 * Canonical in-memory rate limiter for all API routes.
 * Consolidates the old split between rate-limit.ts (used by react + login)
 * and rateLimit.ts (used by comments) — single implementation, two call signatures
 * maintained for backward compat during consolidation.
 *
 * IP spoofing fix: prefer x-real-ip (set by Hostinger's nginx, not the client).
 * Fall back to the LAST entry in x-forwarded-for (closest trusted proxy),
 * NOT the first (which is fully client-controllable).
 */

const store = new Map<string, { count: number; resetAt: number }>();

// Lazy GC: prune when store grows large
function maybePrune(now: number) {
  if (store.size < 5_000) return;
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key);
  }
}

// ── Signature A: used by react/route.ts and login/route.ts ───────────────────
// rateLimit(ip, namespace, max, windowMs) → { limited, retryAfterSec }
export function rateLimit(
  ip: string,
  namespace: string,
  max: number,
  windowMs: number,
): { limited: boolean; retryAfterSec: number };

// ── Signature B: used by comments/route.ts (legacy boolean return) ────────────
// rateLimit(req, { max, windowMs, prefix }) → boolean
export function rateLimit(
  req: { headers: { get(name: string): string | null } },
  opts: { max?: number; windowMs?: number; prefix?: string },
): boolean;

export function rateLimit(
  ipOrReq: string | { headers: { get(name: string): string | null } },
  namespaceOrOpts: string | { max?: number; windowMs?: number; prefix?: string },
  max?: number,
  windowMs?: number,
): { limited: boolean; retryAfterSec: number } | boolean {
  const now = Date.now();
  maybePrune(now);

  let ip: string;
  let namespace: string;
  let maxReq: number;
  let window: number;
  let legacyReturn: boolean;

  if (typeof ipOrReq === 'string') {
    // Signature A
    ip        = ipOrReq;
    namespace = namespaceOrOpts as string;
    maxReq    = max!;
    window    = windowMs!;
    legacyReturn = false;
  } else {
    // Signature B
    const opts = namespaceOrOpts as { max?: number; windowMs?: number; prefix?: string };
    ip        = getClientIP(ipOrReq);
    namespace = opts.prefix ?? 'req';
    maxReq    = opts.max    ?? 10;
    window    = opts.windowMs ?? 60_000;
    legacyReturn = true;
  }

  const key   = `${namespace}:${ip}`;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + window });
    return legacyReturn ? false : { limited: false, retryAfterSec: 0 };
  }

  entry.count++;
  if (entry.count > maxReq) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return legacyReturn ? true : { limited: true, retryAfterSec };
  }
  return legacyReturn ? false : { limited: false, retryAfterSec: 0 };
}

/**
 * Extract the safest available client IP from request headers.
 *
 * Priority:
 *   1. x-real-ip  — set by Hostinger's nginx reverse proxy, NOT client-controllable
 *   2. last entry in x-forwarded-for — closest proxy in the chain (harder to spoof)
 *
 * We deliberately do NOT use x-forwarded-for[0] (the first entry), which is
 * fully attacker-controlled and trivially spoofed to bypass rate limits.
 */
export function getClientIP(req: { headers: { get(name: string): string | null } }): string {
  // Preferred: set by the hosting proxy, clients cannot override it
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();

  // Fallback: take the last (rightmost) IP — added by the closest trusted proxy
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',');
    return parts[parts.length - 1].trim();
  }

  return 'unknown';
}
