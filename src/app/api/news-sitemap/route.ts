/**
 * DEPRECATED — redirects to /news-sitemap.xml
 *
 * The news sitemap was moved from /api/news-sitemap to /news-sitemap.xml
 * because robots.txt disallows /api/ for all bots, and GSC's sitemap fetcher
 * strictly honours that Disallow even when an Allow override is present.
 *
 * This 301 redirect ensures any bookmarks / cached GSC references still work.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in').replace(/\/$/, '');

export async function GET() {
  return NextResponse.redirect(`${BASE}/news-sitemap.xml`, { status: 301 });
}
