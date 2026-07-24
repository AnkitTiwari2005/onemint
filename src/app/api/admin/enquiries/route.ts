import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/enquiries  — fetch all advertiser enquiries (newest first)
 * PATCH /api/admin/enquiries — update enquiry status { id, status }
 */

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json([]);

    const { data, error } = await supabaseAdmin
      .from('advertise_enquiries')
      .select('id, name, company, email, website, format, budget, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

    const { id, status } = await req.json();
    if (!id || !['new', 'replied', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('advertise_enquiries')
      .update({ status })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
