/**
 * GET /api/cron/newsletter
 *
 * Triggered automatically by Vercel Cron on Mon, Wed, Sun.
 * Can also be triggered manually for preview/testing.
 *
 * Query params:
 *   series=monday|wednesday|sunday   — which series to run
 *   preview=true                     — build HTML but don't send
 *
 * Auth:
 *   Set CRON_SECRET in Vercel env vars.
 *   Pass as: Authorization: Bearer <CRON_SECRET>
 *   OR as query param: ?secret=<CRON_SECRET>
 *   (Vercel Cron automatically injects the Authorization header.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runNewsletter, type NewsletterResult } from '@/lib/newsletter-engine';
import type { Series } from '@/lib/newsletter-templates';

// Use Node.js runtime (not Edge) — requires Supabase + full Node APIs
export const runtime = 'nodejs';

// Allow up to 60s for Pro plan cron functions
export const maxDuration = 60;

const VALID_SERIES: Series[] = ['monday', 'wednesday', 'sunday'];

function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  // If no secret is configured, allow from localhost only
  if (!secret) {
    const host = req.headers.get('host') ?? '';
    return host.includes('localhost') || host.includes('127.0.0.1');
  }

  // Check Authorization header (Vercel Cron injects this automatically)
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
