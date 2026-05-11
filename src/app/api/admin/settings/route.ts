import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Allowlist of valid setting keys — rejects unknown keys to prevent config poisoning
const ALLOWED_KEYS = new Set([
  'site_name',
  'site_description',
  'maintenance_mode',
  'allow_comments',
  'newsletter_enabled',
  'contact_email',
  'articles_per_page',
  'featured_article_id',
  'social_twitter',
  'social_linkedin',
  'social_instagram',
  'social_youtube',
  'footer_tagline',
  'meta_keywords',
  'google_analytics_id',
  'plausible_domain',
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
