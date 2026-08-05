import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'onemint_admin_session';

// ── Legacy WordPress URL Redirect Engine ─────────────────────────────────────
// The old onemint.in blog (WordPress) used URL patterns like:
//   /2009/07/24/slug
//   /2012/investments/slug
//   /etf/slug
//   /opinion/slug
// These are still indexed in Google and drive ~3,900 404 events/month.
// This block catches all those patterns at the edge and issues 301 redirects.

/** Old WordPress date-based: /YYYY/MM/DD/slug or /YYYY/MM/slug or /YYYY/slug */
const YEAR_DATE_PATTERN = /^\/(\d{4})(?:\/\d{2}(?:\/\d{2})?)?\/([a-z0-9][a-z0-9-]{2,})\/?$/i;

/** Old WordPress category-based: /category/slug */
const LEGACY_CATEGORIES = new Set([
  'etf', 'opinion', 'investment', 'investments', 'tax',
  'insurance', 'mutual-fund', 'mutual-funds', 'stock-market',
  'real-estate', 'banking', 'credit-card', 'credit-cards',
  'personal-finance', 'health', 'career', 'lifestyle',
  'sports', 'world', 'technology', 'finance', 'economy',
  'gold', 'nps', 'ppf', 'epf', 'ulip',
]);
const CATEGORY_PATTERN = /^\/([a-z][a-z-]+)\/([a-z0-9][a-z0-9-]{2,})\/?$/i;

/** Category → new /topics/ slug fallback (used if article slug doesn't exist in new DB) */
const CATEGORY_TO_TOPIC: Record<string, string> = {
  'etf':              'personal-finance',
  'investment':       'personal-finance',
  'investments':      'personal-finance',
  'mutual-fund':      'personal-finance',
  'mutual-funds':     'personal-finance',
  'tax':              'personal-finance',
  'insurance':        'personal-finance',
  'stock-market':     'personal-finance',
  'banking':          'personal-finance',
  'credit-card':      'personal-finance',
  'credit-cards':     'personal-finance',
  'personal-finance': 'personal-finance',
  'gold':             'personal-finance',
  'nps':              'personal-finance',
  'ppf':              'personal-finance',
  'epf':              'personal-finance',
  'ulip':             'personal-finance',
  'real-estate':      'real-estate',
  'health':           'health-wellness',
  'career':           'careers',
  'lifestyle':        'health-wellness',
  'sports':           'sports-fitness',
  'technology':       'technology-ai',
  'finance':          'personal-finance',
  'economy':          'world-politics',
  'world':            'world-politics',
};

// ── Valid article slugs (generated at build time) ────────────────────────────
// Populated from public/redirect-map.json which is created by
// scripts/generate-redirect-map.ts before every production build.
// If the file doesn't exist yet (first build), the Set is empty and the
// middleware falls back to category/homepage redirects — still no 404s.
let VALID_SLUGS: Set<string> = new Set();
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const map = require('../public/redirect-map.json') as string[];
  VALID_SLUGS = new Set(map);
} catch {
  // File not yet generated — safe to ignore, fallback redirects still work
}

/**
 * Try to resolve a legacy WordPress URL to a new site path.
 * Returns the new pathname string, or null if not a legacy URL.
 *
 * Priority:
 *  1. Slug exists in redirect-map.json → /articles/[slug]       (perfect recovery)
 *  2. Slug not found + known old category → /topics/[category]  (category landing)
 *  3. All else → /                                               (homepage, never 404)
 */
function getLegacyRedirect(pathname: string): string | null {
  let slug: string | null = null;
  let oldCategory: string | null = null;

  const yearMatch = pathname.match(YEAR_DATE_PATTERN);
  if (yearMatch) {
    slug = yearMatch[2].toLowerCase();
  } else {
    const catMatch = pathname.match(CATEGORY_PATTERN);
    if (catMatch) {
      const cat = catMatch[1].toLowerCase();
      if (LEGACY_CATEGORIES.has(cat)) {
        slug = catMatch[2].toLowerCase();
        oldCategory = cat;
      }
    }
  }

  if (!slug) return null; // Not a legacy URL — pass through to Next.js

  if (VALID_SLUGS.has(slug)) return `/articles/${slug}`;
  if (oldCategory && CATEGORY_TO_TOPIC[oldCategory]) return `/topics/${CATEGORY_TO_TOPIC[oldCategory]}`;
  return '/';
}

/** Known new-site top-level paths — never treat these as legacy URLs */
const NEW_SITE_PREFIXES = [
  '/admin', '/api', '/_next', '/articles', '/topics', '/tools',
  '/search', '/newsletter', '/author', '/tag', '/tags', '/saved',
  '/sitemap', '/maintenance', '/series', '/glossary',
];
const NEW_SITE_EXACT = new Set(['/', '/about', '/advertise', '/press', '/suggest', '/favicon.ico', '/robots.txt']);

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
 */
function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === 'true';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') ?? '';

  // ── Canonical domain guard ─────────────────────────────────────────────────
  if (host.endsWith('.vercel.app')) {
    const prodUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, 'https://www.onemint.in');
    return NextResponse.redirect(prodUrl, { status: 308 });
  }

  // ── Legacy WordPress URL redirect ──────────────────────────────────────────
  // Runs before admin/maintenance checks — old URLs must never reach the 404 page.
  const isNewSitePath =
    NEW_SITE_EXACT.has(pathname) ||
    NEW_SITE_PREFIXES.some(p => pathname.startsWith(p));

  if (!isNewSitePath) {
    const redirect = getLegacyRedirect(pathname);
    if (redirect) {
      return NextResponse.redirect(new URL(redirect, req.nextUrl.origin), { status: 301 });
    }
  }

  // ── Admin auth bypass ──────────────────────────────────────────────────────
  if (pathname === '/admin/login') return NextResponse.next();
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next();
  if (pathname.startsWith('/api/admin/analytics/oauth')) return NextResponse.next();

  // ── Maintenance mode ───────────────────────────────────────────────────────
  const isAdminRoute    = pathname.startsWith('/admin');
  const isApiRoute      = pathname.startsWith('/api');
  const isPublicAsset   = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname === '/favicon.ico';
  const isMaintenancePage = pathname === '/maintenance';

  if (isMaintenanceMode() && !isAdminRoute && !isApiRoute && !isPublicAsset && !isMaintenancePage) {
    return NextResponse.redirect(new URL('/maintenance', req.nextUrl.origin));
  }

  // ── Admin session protection ───────────────────────────────────────────────
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
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/((?!_next|static|favicon.ico).*)'],
};
