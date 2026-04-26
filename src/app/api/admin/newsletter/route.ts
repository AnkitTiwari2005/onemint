import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/newsletter — list all subscribers
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, name, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Admin newsletter GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/newsletter — unsubscribe a subscriber by email
export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    // Update in Supabase
    await supabaseAdmin
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', email);

    // Sync unsubscribe to Brevo
    const { ENV } = await import('@/lib/env');
    if (ENV.BREVO_API_KEY) {
      try {
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: { 'api-key': ENV.BREVO_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailBlacklisted: true }),
        });
      } catch {
        // Non-fatal — Supabase already updated
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin newsletter DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
