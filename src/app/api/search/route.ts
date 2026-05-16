import { NextRequest, NextResponse } from 'next/server';
import { typesenseSearch } from '@/lib/typesense';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json({ results: [], found: 0 });

  // ── 1. Try Typesense first ─────────────────────────────────────────────────
  try {
    const result = await typesenseSearch
      .collections('articles')
      .documents()
      .search({
        q,
        query_by: 'title,excerpt,tags,categoryName,authorName',
        highlight_full_fields: 'title,excerpt',
        per_page: 10,
        typo_tokens_threshold: 1,
      });

    if (result.found > 0) {
      const hits = (result.hits ?? []).map((hit) => {
        const doc = hit.document as Record<string, unknown>;
        return {
          id: doc.id,
          title: doc.title,
          excerpt: doc.excerpt,
          slug: doc.slug,
          categoryId: doc.categoryId,
          categoryName: doc.categoryName,
          authorName: doc.authorName,
          tags: doc.tags ?? [],
          publishedAt: doc.publishedAt ?? null,
          readTimeMinutes: doc.readTimeMinutes,
        };
      });
      return NextResponse.json({ results: hits, found: result.found });
    }
    // Typesense returned 0 results — fall through to Supabase
  } catch {
    // Typesense unavailable — fall through to Supabase
  }

  // ── 2. Supabase fallback: simple ilike search on title/excerpt ─────────────
  if (supabaseAdmin) {
    try {
      const pattern = `%${q}%`;
      const { data } = await supabaseAdmin
        .from('articles')
        .select(
          'id, title, slug, excerpt, category_id, read_time_minutes, published_at, ' +
          'categories(name, slug), authors(name)'
        )
        .eq('status', 'published')
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
        .order('published_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const hits = (data as unknown as Array<Record<string, unknown>>).map((doc) => {
          const cat = doc.categories as Record<string, string> | null;
          const auth = doc.authors as Record<string, string> | null;
          return {
            id: doc.id,
            title: doc.title,
            excerpt: doc.excerpt ?? '',
            slug: doc.slug,
            categoryId: cat?.slug ?? doc.category_id ?? '',
            categoryName: cat?.name ?? '',
            authorName: auth?.name ?? '',
            tags: [],
            publishedAt: doc.published_at ?? null,
            readTimeMinutes: doc.read_time_minutes ?? 5,
          };
        });
        return NextResponse.json({ results: hits, found: hits.length });
      }
    } catch (dbErr) {
      console.error('[search] Supabase fallback error:', dbErr);
    }
  }

  // ── 3. Everything failed — return empty (client will use Fuse.js static) ───
  return NextResponse.json({ results: [], found: 0, degraded: true }, { status: 200 });
}
