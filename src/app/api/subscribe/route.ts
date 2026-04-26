import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Store in Supabase first (always — even if Brevo fails)
    if (supabaseAdmin) {
      const { error: dbError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .upsert([{ email: normalizedEmail, name: name?.trim() || '', status: 'active' }], { onConflict: 'email' });
      if (dbError) {
        console.error('[Subscribe] Supabase upsert error:', dbError.message);
      }
    }

    // 2. Add to Brevo (non-fatal if not configured)
    if (!ENV.BREVO_API_KEY) {
      console.warn('[Subscribe] BREVO_API_KEY not configured — skipping Brevo sync');
      return NextResponse.json({ success: true });
    }

    if (!ENV.BREVO_LIST_ID) {
      console.warn('[Subscribe] BREVO_LIST_ID not configured — skipping Brevo list add');
      return NextResponse.json({ success: true });
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': ENV.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        attributes: { FIRSTNAME: name?.trim() || '' },
        listIds: [ENV.BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const brevoData = await brevoRes.json().catch(() => ({}));

    // 201 = new, 204 = updated, duplicate_parameter = already exists — all valid
    const brevoOk = brevoRes.ok || brevoRes.status === 204 || brevoData?.code === 'duplicate_parameter';

    if (!brevoOk) {
      console.error('[Subscribe] Brevo error:', brevoData);
      // Still return success — we saved to Supabase
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Subscribe] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
