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
    const [articles, authors, categories, series] = await Promise.all([
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
    ]);

    return NextResponse.json({
      articles:   articles.data   ?? [],
      authors:    authors.data    ?? [],
      categories: categories.data ?? [],
      series:     series.data     ?? [],
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

    const errors: string[] = [];


    await Promise.all([
      supabaseAdmin.from('articles').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff)
        .then(({ error }) => { if (error) errors.push(`articles: ${error.message}`); }),
      supabaseAdmin.from('authors').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff)
        .then(({ error }) => { if (error) errors.push(`authors: ${error.message}`); }),
      supabaseAdmin.from('categories').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff)
        .then(({ error }) => { if (error) errors.push(`categories: ${error.message}`); }),
      supabaseAdmin.from('series').delete().not('deleted_at', 'is', null).lt('deleted_at', cutoff)
        .then(({ error }) => { if (error) errors.push(`series: ${error.message}`); }),
    ]);

    if (errors.length > 0) {
      console.error('[Admin trash purge] Partial failure:', errors);
      return NextResponse.json({ success: false, errors }, { status: 207 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin trash purge]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

