import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/push/send — send a push notification to all subscribers
 *
 * Body: { title, body, url, icon?, secret }
 * Protected by CRON_SECRET to prevent abuse.
 *
 * Requires web-push npm package:
 *   npm install web-push
 *   npx web-push generate-vapid-keys  (add to .env.local + Vercel env)
 *
 * Env vars needed:
 *   VAPID_SUBJECT=mailto:contact@onemint.in
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *   VAPID_PRIVATE_KEY=<privateKey>
 */
export async function POST(req: NextRequest) {
  // Auth guard
  const secret = req.headers.get('x-cron-secret') ?? (await req.json().catch(() => ({}))).secret;
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, body: msgBody, url, icon } = body;

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  // Verify VAPID config
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@onemint.in';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys not configured. Run: npx web-push generate-vapid-keys' }, { status: 503 });
  }

  // Dynamic import — web-push is optional at build time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let webpush: any;
  try {
    webpush = await import('web-push' as string as never).catch
      ? await import('web-push' as string as never)
      : null;
    if (!webpush) throw new Error('not loaded');
  } catch {
    return NextResponse.json({ error: 'web-push package not installed. Run: npm install web-push' }, { status: 503 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  // Fetch all subscriptions
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
    url: url || 'https://www.onemint.in',
    icon: icon || 'https://www.onemint.in/logo.png',
  });

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        return { ok: true, endpoint: sub.endpoint };
      } catch (err: unknown) {
        // Remove expired/invalid subscriptions (HTTP 410 Gone)
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 410 || status === 404) {
          await supabaseAdmin!.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
        return { ok: false, endpoint: sub.endpoint, status };
      }
    })
  );

  const sent  = results.filter(r => r.status === 'fulfilled' && (r.value as {ok:boolean}).ok).length;
  const failed = results.length - sent;

  return NextResponse.json({ sent, failed, total: subs.length });
}
