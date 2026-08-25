/**
 * GET /api/cron/newsletter
 *
 * Triggered by an external cron job (Hostinger hPanel → Cron Jobs) or manually.
 * Previously triggered by Vercel Cron — now called from an external scheduler.
 *
 * Query params:
 *   series=monday|sunday        — which series to run
 *   preview=true                — build HTML but don't send
 *
 * Auth:
 *   Set CRON_SECRET in env vars.
 *   Pass as: Authorization: Bearer <CRON_SECRET>
 *   OR as query param: ?secret=<CRON_SECRET>
 *
 * Hostinger Cron Job setup (hPanel → Cron Jobs):
 *   Monday:  30 8 * * 1  → curl -s -H "Authorization: Bearer $CRON_SECRET" https://www.onemint.in/api/cron/newsletter?series=monday
 *   Sunday:  30 9 * * 0  → curl -s -H "Authorization: Bearer $CRON_SECRET" https://www.onemint.in/api/cron/newsletter?series=sunday
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsletter, type NewsletterResult } from '@/lib/newsletter-engine';
import type { Series } from '@/lib/newsletter-templates';
import { getCleanEnv } from '@/lib/env';


// Use Node.js runtime (not Edge) — requires Supabase + full Node APIs
export const runtime = 'nodejs';

// maxDuration was a Vercel-only config — removed; has no effect on Hostinger.

const VALID_SERIES: Series[] = ['monday', 'wednesday', 'sunday'];


function isAuthorised(req: NextRequest): boolean {
  const secret = getCleanEnv('CRON_SECRET');

  // If no secret is configured, allow from localhost only
  if (!secret) {
    const host = req.headers.get('host') ?? '';
    return host.includes('localhost') || host.includes('127.0.0.1');
  }

  // Check Authorization header
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader === `Bearer ${secret}`) return true;

  // Check query param for manual testing
  const secretParam = req.nextUrl.searchParams.get('secret') ?? '';
  if (secretParam === secret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse params ────────────────────────────────────────────────────────
  const sp      = req.nextUrl.searchParams;
  const series  = (sp.get('series') ?? '') as Series;
  const preview = sp.get('preview') === 'true';

  if (!VALID_SERIES.includes(series)) {
    return NextResponse.json(
      { error: `Invalid series "${series}". Must be: monday, wednesday, or sunday.` },
      { status: 400 },
    );
  }

  // ── Run ─────────────────────────────────────────────────────────────────
  let result: NewsletterResult;

  try {
    result = await runNewsletter(series, preview);
  } catch (err) {
    console.error(`[Newsletter][${series}] Error:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }

  // ── Skipped ─────────────────────────────────────────────────────────────
  if (result.skipped) {
    return NextResponse.json({ ok: false, skipped: result.skipped }, { status: 200 });
  }

  // ── Preview mode — return HTML directly ─────────────────────────────────
  if (preview) {
    return new NextResponse(result.html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // ── Success ─────────────────────────────────────────────────────────────
  console.log(
    `[Newsletter][${series}] Sent "${result.subject}" — ${result.articleCount} articles, ${result.subscriberCount} subscribers.`,
  );

  return NextResponse.json({
    ok:              true,
    series:          result.series,
    subject:         result.subject,
    articleCount:    result.articleCount,
    subscriberCount: result.subscriberCount,
  });
}
