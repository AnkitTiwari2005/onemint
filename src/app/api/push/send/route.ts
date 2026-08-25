import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase';
import { getCleanEnv } from '@/lib/env';


/**
 * POST /api/push/send — send a push notification to all subscribers
 *
 * Body: { title, body, url?, icon? }
 * Auth: x-cron-secret header must match CRON_SECRET env var.
 *
 * Env vars required:
 *   CRON_SECRET                  — protects this endpoint
 *   VAPID_SUBJECT                — e.g. mailto:contact@onemint.in
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY — base64url VAPID public key
 *   VAPID_PRIVATE_KEY            — VAPID private key
 *
 * Generate VAPID keys: npx web-push generate-vapid-keys
 */
export async function POST(req: NextRequest) {
  // ── Auth (header only — never read the body for secrets) ─────────────────
  const secret = req.headers.get('x-cron-secret');
  if (secret !== getCleanEnv('CRON_SECRET')) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }


  // ── Parse body (single read — req.json() can only be called once) ─────────
  let title: string, msgBody: string, url: string | undefined, icon: string | undefined;
  try {
    const body = await req.json();
    title   = body.title;
    msgBody = body.body;
    url     = body.url;
    icon    = body.icon;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  // ── VAPID config ───────────────────────────────────────────────────────────
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@onemint.in';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json(
      { error: 'VAPID keys not configured — run: npx web-push generate-vapid-keys' },
      { status: 503 }
    );
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  // ── Fetch subscriptions ────────────────────────────────────────────────────
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No subscribers yet' });
  }

  const payload = JSON.stringify({
    title,
    body: msgBody,
    url:  url  || 'https://www.onemint.in',
    icon: icon || 'https://www.onemint.in/logo.png',
  });

  // ── Send to all subscribers ────────────────────────────────────────────────
  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        return { ok: true, endpoint: sub.endpoint };
      } catch (err: unknown) {
        // Remove expired/invalid subscriptions (HTTP 410 Gone or 404 Not Found)
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          await supabaseAdmin!.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        return { ok: false, endpoint: sub.endpoint, status };
      }
    })
  );

  const sent   = results.filter(r => r.status === 'fulfilled' && (r.value as { ok: boolean }).ok).length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed, total: subs.length });
}


