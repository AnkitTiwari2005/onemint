/**
 * GET /api/admin/analytics/oauth?action=start  → redirects to Google consent
 * GET /api/admin/analytics/oauth?code=xxx       → exchanges code, returns JSON
 *
 * This route is protected by middleware admin auth (session cookie required).
 * Used once during setup to obtain a GA4 refresh token.
 *
 * Add these redirect URIs in Google Cloud Console → Credentials → OAuth client:
 *   http://localhost:3000/api/admin/analytics/oauth
 *   https://www.onemint.in/api/admin/analytics/oauth
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCleanEnv } from '@/lib/env';

const CLIENT_ID     = getCleanEnv('GA4_CLIENT_ID');
const CLIENT_SECRET = getCleanEnv('GA4_CLIENT_SECRET');
const SCOPE         = 'https://www.googleapis.com/auth/analytics.readonly';

function getRedirectUri(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  return `${proto}://${host}/api/admin/analytics/oauth`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const code   = searchParams.get('code');

  // ── Start: redirect to Google consent ──────────────────────────────────────
  if (action === 'start') {
    const redirectUri = getRedirectUri(req);
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id',     CLIENT_ID);
    authUrl.searchParams.set('redirect_uri',  redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope',         SCOPE);
    authUrl.searchParams.set('access_type',   'offline');
    authUrl.searchParams.set('prompt',        'consent'); // forces refresh_token
    return NextResponse.redirect(authUrl.toString());
  }

  // ── Callback: exchange code for refresh_token ──────────────────────────────
  if (code) {
    const redirectUri = getRedirectUri(req);
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:     CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri:  redirectUri,
          grant_type:    'authorization_code',
        }),
      });
      const json = await tokenRes.json();

      if (json.refresh_token) {
        // Return token as JSON — caller (admin analytics page) reads it and
        // displays a copyable banner. NOT a redirect URL param (tokens in URLs
        // end up in server access logs and Referer headers).
        return NextResponse.json({ refresh_token: json.refresh_token });
      }

      return NextResponse.json(
        { error: 'No refresh_token in response. Did you set prompt=consent?', raw: json },
        { status: 400 }
      );
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Pass ?action=start or ?code=...' }, { status: 400 });
}
