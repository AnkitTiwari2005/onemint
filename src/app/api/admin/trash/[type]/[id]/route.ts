import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const TABLE_MAP: Record<string, string> = {
  articles:    'articles',
  authors:     'authors',
  categories:  'categories',
  series:      'series',
  suggestions: 'topic_suggestions',
  messages:    'contact_messages',
};

/**
 * POST /api/admin/trash/[type]/[id] — restore an item from trash
 * Sets deleted_at = null so it reappears in its normal admin list.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  }

  const { type, id } = await context.params;
  const table = TABLE_MAP[type];
  if (!table) {
    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from(table)
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      console.error(`[Admin trash restore ${type}]`, error.message);
      return NextResponse.json({ error: 'Failed to restore item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[Admin trash restore ${type}]`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/trash/[type]/[id] — permanently delete a single item
 * Only callable from trash — bypasses the soft-delete layer.
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ type: string; id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  }

  const { type, id } = await context.params;
  const table = TABLE_MAP[type];
  if (!table) {
    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id)
      .not('deleted_at', 'is', null); // Safety: only delete already-soft-deleted rows

    if (error) {
      console.error(`[Admin trash delete ${type}]`, error.message);
      return NextResponse.json({ error: 'Failed to permanently delete item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[Admin trash delete ${type}]`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
