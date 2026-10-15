/**
 * Google Analytics 4 Data API v1beta — server-side service
 * Uses Service Account JWT auth (RS256) for permanent server-to-server access.
 * Access tokens are cached in memory for their lifetime (~1 h).
 * Zero external dependencies — uses Node.js built-in Web Crypto API (crypto.subtle).
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import { getCleanEnv } from '@/lib/env';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? '';
const TOKEN_ENDPOINT  = 'https://oauth2.googleapis.com/token';
const GA4_SCOPE       = 'https://www.googleapis.com/auth/analytics.readonly';
const GA4_API_BASE    = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}`;

/** In-memory access-token cache — survives across warm serverless invocations */
let _cachedToken: { token: string; expiresAt: number } | null = null;

// ── JWT helpers (Web Crypto API — built into Node 18+) ────────────────────────

/** Base64url-encode a Uint8Array (no padding). */
function b64url(data: Uint8Array): string {
  return Buffer.from(data).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Encode a plain object as base64url JSON. */
function b64urlJson(obj: Record<string, unknown>): string {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

/**
 * Build and sign a JWT for the Google OAuth2 token endpoint.
 * Uses RS256 (RSA-SHA256) with the service account's private key.
 */
async function buildJWT(clientEmail: string, privateKeyPem: string): Promise<string> {
  // Strip PEM armour and decode the DER bytes
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const keyBytes = Uint8Array.from(Buffer.from(pemBody, 'base64'));

  // Import the private key into Web Crypto
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const now = Math.floor(Date.now() / 1000);
  const header  = b64urlJson({ alg: 'RS256', typ: 'JWT' });
  const payload = b64urlJson({
    iss: clientEmail,
    scope: GA4_SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  });

  const signingInput = `${header}.${payload}`;
  const sigBytes = new Uint8Array(
    await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(signingInput),
    ),
  );

  return `${signingInput}.${b64url(sigBytes)}`;
}

// ── Public token getter ───────────────────────────────────────────────────────

/**
 * Returns a valid GA4 access token, refreshing via Service Account JWT when necessary.
 * The service account JSON is stored base64-encoded in GA4_SERVICE_ACCOUNT_KEY.
 */
export async function getAccessToken(): Promise<string | null> {
  const saKeyB64 = getCleanEnv('GA4_SERVICE_ACCOUNT_KEY');
  if (!saKeyB64) return null;

  // Serve from cache with a 60-second safety buffer
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.token;
  }

  try {
    // Decode the base64 service account JSON
    const saJson = JSON.parse(Buffer.from(saKeyB64, 'base64').toString('utf8')) as {
      client_email: string;
      private_key: string;
      token_uri?: string;
    };

    const jwt = await buildJWT(saJson.client_email, saJson.private_key);

    const res = await fetch(saJson.token_uri ?? TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
      signal: AbortSignal.timeout(6_000),
    });

    if (!res.ok) {
      console.error('[GA4] Token fetch failed:', res.status, await res.text());
      return null;
    }

    const json = await res.json() as { access_token: string; expires_in?: number };
    _cachedToken = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
    return _cachedToken.token;
  } catch (e) {
    console.error('[GA4] Token error:', e);
    return null;
  }
}

/** Returns true when all required GA4 env vars are present. */
export function isGA4Configured(): boolean {
  return !!(getCleanEnv('GA4_SERVICE_ACCOUNT_KEY') && process.env.GA4_PROPERTY_ID);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runReport(body: Record<string, unknown>): Promise<any> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${GA4_API_BASE}:runReport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      console.error('[GA4] Report error:', res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (e) {
    console.error('[GA4] Report fetch error:', e);
    return null;
  }
}

// ── Fixed-range helpers (used by the live dashboard) ─────────────────────────

/** Aggregate: last 7 days (pageviews, users, bounce rate, avg session) */
export function getAggregate7d() {
  return runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });
}

/** Daily breakdown — last 7 days */
export function getTimeseries7d() {
  return runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
}

/** Monthly breakdown — last 6 months */
export function getTimeseries6mo() {
  return runReport({
    dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'yearMonth' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
  });
}

/** Top 5 /articles/* pages by screen page views */
export function getTopPages() {
  return runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'BEGINS_WITH', value: '/articles/' },
      },
    },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 5,
  });
}

/** Top 6 traffic channels (Organic Search, Direct, Social, …) */
export function getTrafficSources() {
  return runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 6,
  });
}

/** Device category split: mobile / desktop / tablet */
export function getDeviceSplit() {
  return runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
}

// ── Parameterised helpers (used by the report generator) ─────────────────────

/** Aggregate metrics for an arbitrary date range. */
export function getAggregateForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'totalUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });
}

/** Daily timeseries for an arbitrary date range (max 90 points sensibly). */
export function getTimeseriesForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });
}

/** Monthly timeseries for an arbitrary date range. */
export function getTimeseriesMonthlyForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'yearMonth' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
  });
}

/** Top /articles/* pages for an arbitrary date range. */
export function getTopPagesForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'BEGINS_WITH', value: '/articles/' },
      },
    },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });
}

/** Traffic sources for an arbitrary date range. */
export function getTrafficSourcesForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 6,
  });
}

/** Device split for an arbitrary date range. */
export function getDeviceSplitForRange(startDate: string, endDate: string) {
  return runReport({
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
}

// ── Shared extraction utilities ───────────────────────────────────────────────

/** Extract a numeric metric value from a GA4 report's first row. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractMetric(report: any, metricIndex: number, rowIndex = 0): number {
  return parseFloat(report?.rows?.[rowIndex]?.metricValues?.[metricIndex]?.value ?? '0');
}

/** Extract a string dimension value from a GA4 report row. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDimension(row: any, dimIndex: number): string {
  return row?.dimensionValues?.[dimIndex]?.value ?? '';
}
