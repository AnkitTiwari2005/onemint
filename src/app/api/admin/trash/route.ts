import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/trash
 * Returns all soft-deleted items grouped by type.
 * Only rows where deleted_at IS NOT NULL are returned.
 */
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  }

  try {
    const [articles, authors, categories, series, suggestions, messages] = await Promise.all([
      supabaseAdmin
        .from('articles')
        .select('id, title, slug, status, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),

      supabaseAdmin
        .from('authors')
        .select('id, name, slug, role, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),

      supabaseAdmin
        .from('categories')
        .select('id, name, slug, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),

      supabaseAdmin
        .from('series')
        .select('id, name, slug, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),

      supabaseAdmin
        .from('topic_suggestions')
        .select('id, topic, email, votes, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),

      supabaseAdmin
        .from('contact_messages')
        .select('id, name, email, subject, deleted_at, created_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false }),
    ]);

    return NextResponse.json({
      articles:    articles.data    ?? [],
      authors:     authors.data     ?? [],
      categories:  categories.data  ?? [],
      series:      series.data      ?? [],
      suggestions: suggestions.data ?? [],
      messages:    messages.data    ?? [],
    });
  } catch (err) {
    console.error('[Admin trash GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/trash — purge all items older than 30 days permanently.
 * Called by the "Purge old items" button in the trash UI.
 */
export async function DELETE() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  }

  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    await Promise.all([
      supabaseAdmin.from('articles').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
      supabaseAdmin.from('authors').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
      supabaseAdmin.from('categories').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
      supabaseAdmin.from('series').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
      supabaseAdmin.from('topic_suggestions').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
      supabaseAdmin.from('contact_messages').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin trash purge]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
