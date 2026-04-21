import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // 1. Add to Brevo
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': ENV.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name || '' },
        listIds: [ENV.BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    const brevoData = await brevoRes.json();

    // 201 = new contact, 204 = updated, duplicate_parameter = already exists — all ok
    const brevoOk =
      brevoRes.ok ||
      brevoRes.status === 204 ||
      brevoData.code === 'duplicate_parameter';

    if (!brevoOk) {
      console.error('Brevo error:', brevoData);
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }

    // 2. Store in Supabase for admin visibility
    await supabase
      .from('newsletter_subscribers')
      .upsert([{ email, name: name || '', status: 'active' }], { onConflict: 'email' });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
