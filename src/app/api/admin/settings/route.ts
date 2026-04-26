import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/settings — load all settings
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({}, { status: 200 }); // Return empty — UI uses defaults
    }

    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('[Settings GET]', error.message);
      return NextResponse.json({}, { status: 200 });
    }

    // Convert rows [{key, value}] → flat object {key: value}
    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (err) {
    console.error('[Settings GET] Unexpected:', err);
    return NextResponse.json({}, { status: 200 });
  }
}

// PUT /api/admin/settings — upsert settings
export async function PUT(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await req.json();

    // Convert flat object → [{key, value, updated_at}] rows
    const rows = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.error('[Settings PUT]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Settings PUT] Unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
