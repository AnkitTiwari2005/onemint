import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { typesenseAdmin } from '@/lib/typesense';
import { ENV, getCleanEnv } from '@/lib/env';


// GET /api/admin/articles/[id] — load article for edit page
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`*, categories(id, name, slug), authors(id, name, slug)`)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin articles GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/articles/[id] — update article
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const body = await req.json();

    // Whitelist only safe, user-editable fields — never allow id / created_at etc.
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Restore from trash: just clear deleted_at
    if (body.restore === true) {
      const { data, error } = await supabaseAdmin
        .from('articles')
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: 'Failed to restore article' }, { status: 500 });
      return NextResponse.json(data);
    }

    const allowed = [
      'title', 'slug', 'deck', 'excerpt', 'content', 'cover_image',
      'status', 'category_id', 'author_id', 'tags',
      'meta_title', 'meta_description', 'published_at',
      'read_time_minutes', 'faqs',
    ];
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    // Auto-set published_at when publishing for the first time
    if (body.status === 'published' && !body.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    // Trigger Typesense sync if publishing (non-blocking)
    if (data?.status === 'published' && ENV.SITE_URL) {
      fetch(`${ENV.SITE_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sync-secret': getCleanEnv('SYNC_SECRET') || getCleanEnv('ADMIN_PASSWORD_HASH'),
        },
        body: JSON.stringify({ articleId: id }),
      }).catch((err) => console.error('[Sync trigger PATCH]', err));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[Admin articles PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/articles/[id] — delete article
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const { error } = await supabaseAdmin
      .from('articles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    // De-index from Typesense so deleted content stops appearing in search
    try {
      await typesenseAdmin.collections('articles').documents(id).delete();
    } catch {
      // Doc may not be indexed — not a failure condition
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin articles DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
