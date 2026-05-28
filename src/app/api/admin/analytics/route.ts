import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  getAggregate7d, getTimeseries7d, getTimeseries6mo,
  getTopPages, getTrafficSources, getDeviceSplit,
  getAggregateForRange, getTimeseriesForRange, getTimeseriesMonthlyForRange,
  getTopPagesForRange, getTrafficSourcesForRange, getDeviceSplitForRange,
  isGA4Configured, extractMetric, extractDimension,
} from '@/lib/ga4';

export interface AnalyticsStats {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionSec: number;
  bounceRate: number;
  topArticles: { title: string; views: number; trend: 'up' | 'down' }[];
  trafficSources: { source: string; pct: number }[];
  deviceSplit: { device: string; sessions: number; pct: number }[];
  weeklyChart: { day: string; views: number; unique: number }[];
  monthlyChart: { month: string; views: number }[];
  totalSubscribers: number;
  totalArticles: number;
  fromGA4: boolean;
  fromPlausible: boolean;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function getSupabaseCounts() {
  if (!supabaseAdmin) return { subscribers: 0, articles: 0 };
  const [subResult, artResult] = await Promise.all([
    supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  return { subscribers: subResult.count ?? 0, articles: artResult.count ?? 0 };
}

async function getSupabaseTopArticles() {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from('articles').select('title, view_count').eq('status', 'published')
    .order('view_count', { ascending: false, nullsFirst: false }).limit(10);
  const rows = data ?? [];
  const median = rows.length > 0
    ? (rows[Math.floor(rows.length / 2)]?.view_count ?? 0)
    : 0;
  return rows.map((a) => ({
    title: a.title as string,
    views: (a.view_count as number) ?? 0,
    trend: ((a.view_count ?? 0) >= median ? 'up' : 'down') as 'up' | 'down',
  }));
}

// ── Date range resolver ───────────────────────────────────────────────────────
/**
 * Given optional ?start= and ?end= params, returns { startDate, endDate }
 * in the format GA4 accepts (YYYY-MM-DD or NdaysAgo strings).
 * When no params are provided, defaults to the standard 7-day dashboard range.
 */
function resolveDateRange(start: string | null, end: string | null): { startDate: string; endDate: string } | null {
  if (!start && !end) return null; // signal to use default helpers

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  if (start && end) {
    return { startDate: start, endDate: end };
  }

  // Preset shorthands passed from the frontend
  switch (start) {
    case 'last7':    return { startDate: '7daysAgo',   endDate: 'today' };
    case 'last30':   return { startDate: '30daysAgo',  endDate: 'today' };
    case 'last90':   return { startDate: '90daysAgo',  endDate: 'today' };
    case 'thisYear': {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      return { startDate: fmt(jan1), endDate: 'today' };
    }
    case 'lifetime': return { startDate: '2020-01-01', endDate: 'today' };
    default:         return null;
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    // Parse optional date-range query params
    const sp    = req.nextUrl.searchParams;
    const start = sp.get('start');
    const end   = sp.get('end');
    const range = resolveDateRange(start, end);

    const { subscribers, articles } = await getSupabaseCounts();

    // GA4 credentials not set — return zeroed stats with Supabase data only
    if (!isGA4Configured()) {
      return NextResponse.json({
        pageViews: 0, uniqueVisitors: 0, avgSessionSec: 0, bounceRate: 0,
        topArticles: await getSupabaseTopArticles(),
        trafficSources: [], deviceSplit: [],
        weeklyChart: [], monthlyChart: [],
        totalSubscribers: subscribers, totalArticles: articles,
        fromGA4: false, fromPlausible: false,
      } satisfies AnalyticsStats);
    }

    // ── Fetch GA4 in parallel — use range-specific helpers when a range is given
    let aggregateResult, weeklyResult, monthlyResult, topPagesResult, sourcesResult, devicesResult;

    if (range) {
      // Report mode: fetch everything for the requested date range
      [aggregateResult, weeklyResult, monthlyResult, topPagesResult, sourcesResult, devicesResult] =
        await Promise.allSettled([
          getAggregateForRange(range.startDate, range.endDate),
          getTimeseriesForRange(range.startDate, range.endDate),
          getTimeseriesMonthlyForRange(range.startDate, range.endDate),
          getTopPagesForRange(range.startDate, range.endDate),
          getTrafficSourcesForRange(range.startDate, range.endDate),
          getDeviceSplitForRange(range.startDate, range.endDate),
        ]);
    } else {
      // Dashboard mode: use the fixed-window helpers (unchanged behaviour)
      [aggregateResult, weeklyResult, monthlyResult, topPagesResult, sourcesResult, devicesResult] =
        await Promise.allSettled([
          getAggregate7d(), getTimeseries7d(), getTimeseries6mo(),
          getTopPages(), getTrafficSources(), getDeviceSplit(),
        ]);
    }

    const aggregate = aggregateResult.status === 'fulfilled' ? aggregateResult.value : null;
    const weekly    = weeklyResult.status    === 'fulfilled' ? weeklyResult.value    : null;
    const monthly   = monthlyResult.status   === 'fulfilled' ? monthlyResult.value   : null;
    const topPages  = topPagesResult.status  === 'fulfilled' ? topPagesResult.value  : null;
    const sources   = sourcesResult.status   === 'fulfilled' ? sourcesResult.value   : null;
    const devices   = devicesResult.status   === 'fulfilled' ? devicesResult.value   : null;

    // If the aggregate (core metrics) failed, GA4 is unreachable
    if (!aggregate) {
      return NextResponse.json({
        pageViews: 0, uniqueVisitors: 0, avgSessionSec: 0, bounceRate: 0,
        topArticles: await getSupabaseTopArticles(),
        trafficSources: [], deviceSplit: [],
        weeklyChart: [], monthlyChart: [],
        totalSubscribers: subscribers, totalArticles: articles,
        fromGA4: false, fromPlausible: false,
      } satisfies AnalyticsStats);
    }

    // Map aggregate metrics
    const pageViews      = Math.round(extractMetric(aggregate, 0));
    const uniqueVisitors = Math.round(extractMetric(aggregate, 1));
    const bounceRate     = Math.round(extractMetric(aggregate, 2) * 100);
    const avgSessionSec  = Math.round(extractMetric(aggregate, 3));

    // Daily chart — if the range is > 90 days, group by month-level labels instead
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weeklyChart = (weekly?.rows ?? []).map((row: any) => {
      const dateStr = extractDimension(row, 0); // YYYYMMDD
      const d = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`);
      return {
        day:    DAYS[d.getDay()],
        views:  Math.round(parseFloat(row.metricValues?.[0]?.value ?? '0')),
        unique: Math.round(parseFloat(row.metricValues?.[1]?.value ?? '0')),
      };
    });

    // Monthly chart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyChart = (monthly?.rows ?? []).map((row: any) => {
      const ym = extractDimension(row, 0); // YYYYMM
      return {
        month: MONTHS[parseInt(ym.slice(4, 6), 10) - 1] ?? ym,
        views: Math.round(parseFloat(row.metricValues?.[0]?.value ?? '0')),
      };
    });

    // Top articles — prefer GA4, fall back to Supabase view counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ga4TopRows = (topPages?.rows ?? []) as any[];
    const ga4ViewCounts = ga4TopRows.map(r => Math.round(parseFloat(r.metricValues?.[0]?.value ?? '0')));
    const ga4Median = ga4ViewCounts.length > 0 ? ga4ViewCounts[Math.floor(ga4ViewCounts.length / 2)] : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ga4TopArticles = ga4TopRows.map((row: any, i: number) => {
      const path  = extractDimension(row, 0);
      const title = path.replace('/articles/', '').replace(/-/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      const views = ga4ViewCounts[i];
      return {
        title,
        views,
        trend: (views >= ga4Median ? 'up' : 'down') as 'up' | 'down',
      };
    });
    const topArticles = ga4TopArticles.length ? ga4TopArticles : await getSupabaseTopArticles();

    // Traffic sources
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceRows = (sources?.rows ?? []) as any[];
    const totalSessions = sourceRows.reduce(
      (s: number, r: { metricValues?: { value?: string }[] }) =>
        s + parseFloat(r.metricValues?.[0]?.value ?? '0'), 0
    ) || 1;
    const trafficSources = sourceRows.map(r => ({
      source: extractDimension(r, 0) || 'Direct',
      pct:    Math.round((parseFloat(r.metricValues?.[0]?.value ?? '0') / totalSessions) * 100),
    }));

    // Device split
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deviceRows = (devices?.rows ?? []) as any[];
    const totalDeviceSessions = deviceRows.reduce(
      (s: number, r: { metricValues?: { value?: string }[] }) =>
        s + parseFloat(r.metricValues?.[0]?.value ?? '0'), 0
    ) || 1;
    const deviceSplit = deviceRows.map(r => {
      const raw      = extractDimension(r, 0) || 'unknown';
      const sessions = Math.round(parseFloat(r.metricValues?.[0]?.value ?? '0'));
      return {
        device:   raw.charAt(0).toUpperCase() + raw.slice(1),
        sessions,
        pct: Math.round((sessions / totalDeviceSessions) * 100),
      };
    });

    return NextResponse.json({
      pageViews, uniqueVisitors, avgSessionSec, bounceRate,
      topArticles,
      trafficSources,
      deviceSplit,
      weeklyChart,
      monthlyChart,
      totalSubscribers: subscribers,
      totalArticles: articles,
      fromGA4: true,
      fromPlausible: false,
    } satisfies AnalyticsStats);

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
