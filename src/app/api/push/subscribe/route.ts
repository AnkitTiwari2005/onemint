import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/push/subscribe  — store a push subscription from a browser
 * DELETE /api/push/subscribe — remove a subscription by endpoint
 *
 * Push subscriptions are stored in the push_subscriptions table:
 *   CREATE TABLE push_subscriptions (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     endpoint text UNIQUE NOT NULL,
 *     p256dh text NOT NULL,
 *     auth text NOT NULL,
 *     created_at timestamptz DEFAULT now()
 *   );
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      // Accept silently — push will be a no-op but page won't break
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: 'endpoint' }
      );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push/subscribe POST]', err);
    return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

    if (supabaseAdmin) {
      await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push/subscribe DELETE]', err);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
