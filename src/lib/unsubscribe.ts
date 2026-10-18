/**
 * unsubscribe.ts
 * Cryptographic helpers for newsletter unsubscribe token generation and verification.
 * HMAC-SHA256 signed, base64url-encoded tokens with 90-day expiry.
 *
 * Extracted from api/unsubscribe/route.ts so the logic can be imported
 * without violating Next.js App Router rules that forbid non-handler
 * named exports from route.ts files.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { getCleanEnv } from '@/lib/env';

function getUnsubscribeSecret(): string {
  // Use a dedicated secret if set, fall back to the session secret.
  // In production, set UNSUBSCRIBE_SECRET in env vars.
  return getCleanEnv('UNSUBSCRIBE_SECRET') || getCleanEnv('ADMIN_SESSION_SECRET') || '';
}

/**
 * Generate an HMAC-SHA256 signed unsubscribe token for a subscriber email.
 * Token format: base64url(JSON({email, exp})).base64url(sig)
 * Expiry: 90 days from generation.
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = getUnsubscribeSecret();
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET not set');

  const exp = Date.now() + 90 * 24 * 60 * 60 * 1000; // 90 days
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/**
 * Verify an unsubscribe token and return the associated email address.
 * Returns null if the token is invalid, tampered, or expired.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const secret = getUnsubscribeSecret();
    if (!secret) return null;

    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return null;

    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    // Timing-safe comparison
    const expectedSig = createHmac('sha256', secret).update(payload).digest('base64url');
    const a = Buffer.from(expectedSig, 'utf8');
    const b = Buffer.from(sig, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.email || !data.exp || Date.now() > data.exp) return null;

    return data.email as string;
  } catch {
    return null;
  }
}
