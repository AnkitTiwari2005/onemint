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

// ── Correct topic slugs from src/data/categories.ts ──────────────────────────
// IMPORTANT: these MUST match the actual slugs in categories.ts exactly.
// Wrong slugs here → 404 on the destination page.
const CATEGORY_TO_TOPIC: Record<string, string> = {
  // Finance
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
  'finance':          'personal-finance',
  // Technology
  'technology':       'technology-ai',
  'tech':             'technology-ai',
  // Health
  'health':           'health-wellness',
  // Career (correct slug: career-work, NOT careers)
  'career':           'career-work',
  // Lifestyle (correct slug: lifestyle-home, NOT health-wellness)
  'lifestyle':        'lifestyle-home',
  // Sports (correct slug: sports-fitness)
  'sports':           'sports-fitness',
  // World / Economy
  'economy':          'world-politics',
  'world':            'world-politics',
  // Real estate — no real-estate category exists; use personal-finance fallback
  'real-estate':      'personal-finance',
  // Opinion → homepage (no matching topic)
  'opinion':          '',
};

// ── Valid article slugs (ESM import — safe in Edge runtime) ──────────────────
// Generated at build time by scripts/generate-redirect-map.ts.
// ESM static import is the ONLY way to read a JSON file in Edge Middleware —
// dynamic require() is NOT supported in the Edge runtime and will crash.
// If the file doesn't exist, the import will fail at build time (not runtime),
// so we catch that with a try/catch around the import in a variable.
import type { } from 'next';  // keep this import to ensure ESM mode

// We use a module-level variable initialised from the JSON.
// The JSON import itself is statically analysed by the bundler — safe for Edge.
let VALID_SLUGS: Set<string>;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const redirectMap: string[] = require('../../public/redirect-map.json');
  VALID_SLUGS = new Set(redirectMap);
} catch {
  VALID_SLUGS = new Set();
}

/**
 * Try to resolve a legacy WordPress URL to a new site path.
 * Returns the new pathname, or null if this isn't a legacy URL.
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

  if (!slug) return null;

  // Best case: slug exists verbatim on new site → direct article redirect
  if (VALID_SLUGS.has(slug)) return `/articles/${slug}`;

  // Fallback: known old category → topic page
  if (oldCategory) {
    const topicSlug = CATEGORY_TO_TOPIC[oldCategory];
    if (topicSlug) return `/topics/${topicSlug}`;
    // 'opinion' and unmapped categories → homepage
  }

  return '/';
}

/** Known new-site top-level paths — never treat these as legacy URLs */
const NEW_SITE_PREFIXES = [
  '/admin', '/api', '/_next', '/articles', '/topics', '/tools',
  '/search', '/newsletter', '/author', '/tag', '/tags', '/saved',
  '/sitemap', '/maintenance', '/series', '/glossary',
];
const NEW_SITE_EXACT = new Set([
  '/', '/about', '/advertise', '/press', '/suggest',
  '/favicon.ico', '/robots.txt',
]);

/**
 * Verify an HMAC-signed session token in Edge runtime.
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
