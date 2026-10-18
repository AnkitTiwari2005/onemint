import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/settings
 * Public endpoint — exposes only non-sensitive UI settings.
 * Never returns secrets (API keys, credentials).
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ commentsEnabled: false });
    }

    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['commentsEnabled']);

    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({
      commentsEnabled: settings.commentsEnabled === true,
    });
  } catch {
    // Default-deny on error
    return NextResponse.json({ commentsEnabled: false });
  }
}
