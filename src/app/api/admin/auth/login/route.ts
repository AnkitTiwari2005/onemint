import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes, createHmac } from 'crypto';
import { ENV } from '@/lib/env';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Generate a signed session token using HMAC-SHA256.
 * Token = `nonce.expiry_ms.sig`  — verifiable by middleware without a DB round-trip.
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
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const hash = ENV.ADMIN_PASSWORD_HASH;
    if (!hash) {
      console.warn('[AdminAuth] ADMIN_PASSWORD_HASH not set');
      return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      await new Promise(r => setTimeout(r, 300)); // slow brute-force
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Use hash as signing secret (available in both Node.js and Edge)
    const secret = hash || ENV.SUPABASE_SERVICE_ROLE_KEY;
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
