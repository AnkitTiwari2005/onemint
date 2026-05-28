/**
 * Google Analytics 4 Data API v1beta — server-side service
 * Uses OAuth 2.0 refresh-token grant for secure server-to-server access.
 * Access tokens are cached in memory for their lifetime (~1 h).
 * Docs: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? '';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GA4_API_BASE = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}`;

/** In-memory access-token cache — survives across warm serverless invocations */
let _cachedToken: { token: string; expiresAt: number } | null = null;

/** Returns a valid access token, refreshing when necessary. */
export async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GA4_CLIENT_ID;
  const clientSecret = process.env.GA4_CLIENT_SECRET;
  const refreshToken = process.env.GA4_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  // Serve from cache with a 60-second safety buffer
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.token;
  }

  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(6_000),
    });

    if (!res.ok) {
      console.error('[GA4] Token refresh failed:', res.status, await res.text());
      return null;
    }

    const json = await res.json();
    _cachedToken = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    };
    return _cachedToken.token;
  } catch (e) {
    console.error('[GA4] Token refresh error:', e);
    return null;
  }
}

/** Returns true when all required GA4 env vars are present. */
export function isGA4Configured(): boolean {
  return !!(
    process.env.GA4_CLIENT_ID &&
    process.env.GA4_CLIENT_SECRET &&
    process.env.GA4_REFRESH_TOKEN &&
    process.env.GA4_PROPERTY_ID
  );
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
