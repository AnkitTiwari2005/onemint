import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ENV } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const hash = ENV.ADMIN_PASSWORD_HASH;
    if (!hash) {
      // Fallback for initial setup — only works if no hash is configured
      console.warn('[AdminAuth] ADMIN_PASSWORD_HASH not set — auth disabled');
      return NextResponse.json({ error: 'Admin not configured' }, { status: 503 });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      // Small delay to slow brute-force without being obvious
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Set an HTTP-only session cookie (30 days)
    const response = NextResponse.json({ success: true });
    response.cookies.set(ENV.ADMIN_SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[AdminAuth] Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
