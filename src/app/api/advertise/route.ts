import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

/**
 * POST /api/advertise
 * Stores advertiser enquiries in the advertise_enquiries table.
 * Also sends an email notification via Supabase (if configured) or just stores the record.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 3 enquiries per 10 minutes per IP (prevent form spam)
  if (rateLimit(req, { max: 3, windowMs: 10 * 60_000, prefix: 'advertise' })) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  try {
    const body = await req.json();
    const { name, company, email, website, format, budget, message } = body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const record = {
      name: String(name).slice(0, 120),
      company: company ? String(company).slice(0, 120) : null,
      email: String(email).slice(0, 254),
      website: website ? String(website).slice(0, 500) : null,
      format: format ? String(format).slice(0, 120) : null,
      budget: budget ? String(budget).slice(0, 80) : null,
      message: String(message).slice(0, 2000),
      created_at: new Date().toISOString(),
      status: 'new',
    };

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('advertise_enquiries').insert(record);
      if (error) {
        console.error('[Advertise API] DB insert error:', error.message);
        // Still return 200 — we don't want to show DB errors to advertisers
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Advertise API]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
