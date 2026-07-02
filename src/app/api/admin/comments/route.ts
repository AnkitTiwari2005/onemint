import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/comments?status=pending|approved|spam — list comments
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json([]);
  try {
    const status = req.nextUrl.searchParams.get('status') || 'pending';
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PATCH /api/admin/comments — approve or mark spam
export async function PATCH(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  try {
    const { id, status } = await req.json();
    if (!id || !['approved', 'spam', 'pending'].includes(status)) return NextResponse.json({ error: 'id and valid status required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('comments').update({ status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE /api/admin/comments — permanently delete
export async function DELETE(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await supabaseAdmin.from('comments').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
