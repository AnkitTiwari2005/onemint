import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Allowlist of valid setting keys — must match the camelCase keys sent by the settings page
const ALLOWED_KEYS = new Set([
  'siteName',
  'tagline',
  'adminEmail',
  'siteUrl',
  'twitterHandle',
  'gaTrackingId',
  'adsensePublisherId',
  'newsletterProvider',
  'newsletterApiKey',
  'newsletterListId',
  'contactFormEmail',
  'footerCopyright',
  'defaultCategory',
  'articlesPerPage',
  'maintenanceMode',
  'commentsEnabled',
  'newsletterEnabled',
  'darkModeDefault',
]);

// GET /api/admin/settings — load all settings
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({}, { status: 200 });
    }

    const { data, error } = await supabaseAdmin.from('site_settings').select('key, value');

    if (error) {
      console.error('[Settings GET]', error.message);
      return NextResponse.json({}, { status: 200 });
    }

    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      if (ALLOWED_KEYS.has(row.key)) {
        settings[row.key] = row.value;
      }
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

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter((k) => !ALLOWED_KEYS.has(k));
    if (unknownKeys.length > 0) {
      return NextResponse.json(
        { error: `Unknown setting key(s): ${unknownKeys.join(', ')}` },
        { status: 400 }
      );
    }

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
