import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes, createHmac } from 'crypto';
import { ENV } from '@/lib/env';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days


/**
 * Generate a signed session token using HMAC-SHA256.
 * Token = `nonce.expiry_ms.sig` — verifiable by middleware without a DB round-trip.
 */
function generateToken(secret: string): string {
  const nonce = randomBytes(32).toString('hex');
  const expiry = (Date.now() + SESSION_TTL_MS).toString();
  const payload = `${nonce}:${expiry}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return `${nonce}.${expiry}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const { limited, retryAfterSec } = rateLimit(ip, 'admin-login', 10, 15 * 60 * 1000);
    if (limited) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${retryAfterSec}s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Read directly from process.env so the value is always fresh (not cached in the ENV object)
    const hash = process.env.ADMIN_PASSWORD_HASH || '';
    if (!hash) {
      console.warn('[AdminAuth] ADMIN_PASSWORD_HASH not set');
      return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      await new Promise(r => setTimeout(r, 600)); // slow brute-force (doubled)
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Match the same secret priority as middleware to avoid token mismatch / lockout:
    // ADMIN_SESSION_SECRET (dedicated) → ADMIN_PASSWORD_HASH (fallback)
    const secret = process.env.ADMIN_SESSION_SECRET || hash;
    const token = generateToken(secret);

    const response = NextResponse.json({ success: true });
    response.cookies.set(ENV.ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[AdminAuth] Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
