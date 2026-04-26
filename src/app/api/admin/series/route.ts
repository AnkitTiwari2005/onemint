import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/series — list all article series
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json([]);
    }
    const { data, error } = await supabaseAdmin
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin series GET]', error.message);
      return NextResponse.json([]);
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('[Admin series GET] Unexpected:', err);
    return NextResponse.json([]);
  }
}
