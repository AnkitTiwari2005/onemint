import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'onemint_admin_session';

/**
 * Verify an HMAC-signed session token in Edge runtime.
 * Token format: `nonce.expiry_ms.hmac_sha256(nonce:expiry_ms, secret)`
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret =
      process.env.ADMIN_SESSION_SECRET ||
      process.env.ADMIN_PASSWORD_HASH ||
      '';
    if (!secret) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [nonce, expiry, sig] = parts;

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

/**
 * Maintenance mode: read from MAINTENANCE_MODE env var (set to "true" to enable).
 * Using an env var (not DB) because middleware runs in Edge runtime without
 * DB access, and env vars are instantly available after Vercel redeploy.
 * In admin/settings, remind user to set this env var.
 */
function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: login page and auth endpoints
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next();
  // Allow GA4 OAuth flow
  if (pathname.startsWith('/api/admin/analytics/oauth')) return NextResponse.next();

  // ── Maintenance mode ─────────────────────────────────────────────────────
  // Redirect all public (non-admin, non-API) routes to /maintenance page
  const isAdminRoute = pathname.startsWith('/admin');
  const isApiRoute   = pathname.startsWith('/api');
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico';
  const isMaintenancePage = pathname === '/maintenance';

  if (
    isMaintenanceMode() &&
    !isAdminRoute &&
    !isApiRoute &&
    !isPublicAsset &&
    !isMaintenancePage
  ) {
    return NextResponse.redirect(new URL('/maintenance', req.nextUrl.origin));
  }

  // Protect: /admin/* UI pages AND /api/admin/* API routes
  const isAdminUI  = pathname.startsWith('/admin');
  const isAdminAPI = pathname.startsWith('/api/admin');

  if (!isAdminUI && !isAdminAPI) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await verifyToken(token) : false;

  if (!valid) {
    if (isAdminAPI) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/((?!_next|static|favicon.ico).*)'],
};
