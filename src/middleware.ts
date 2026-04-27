import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'onemint_admin_session';

/**
 * Verify an HMAC-signed session token in Edge runtime.
 * Token format: `nonce.expiry_ms.hmac_sha256(nonce:expiry_ms, secret)`
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_PASSWORD_HASH || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!secret) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [nonce, expiry, sig] = parts;

    // Check expiry
    if (Date.now() > parseInt(expiry, 10)) return false;

    const payload = `${nonce}:${expiry}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const computed = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computedHex = Array.from(new Uint8Array(computed))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (computedHex.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < computedHex.length; i++) {
      diff |= computedHex.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: login page and auth endpoints
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next();

  // Protect: /admin/* UI pages AND /api/admin/* API routes
  const isAdminUI  = pathname.startsWith('/admin');
  const isAdminAPI = pathname.startsWith('/api/admin');

  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  // Legacy plain-text fallback check removed — all new sessions use HMAC tokens
  const valid = token ? await verifyToken(token) : false;

  if (!valid) {
    if (isAdminAPI) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
