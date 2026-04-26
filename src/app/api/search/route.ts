import { NextRequest, NextResponse } from 'next/server';
import { typesenseSearch } from '@/lib/typesense';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';

  if (!q.trim()) return NextResponse.json({ results: [], found: 0 });

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

    const hits = (result.hits ?? []).map((hit) => ({
      id: (hit.document as Record<string, unknown>).id,
      title: (hit.document as Record<string, unknown>).title,
      excerpt: (hit.document as Record<string, unknown>).excerpt,
      slug: (hit.document as Record<string, unknown>).slug,
      categoryId: (hit.document as Record<string, unknown>).categoryId,
      categoryName: (hit.document as Record<string, unknown>).categoryName,
      readTimeMinutes: (hit.document as Record<string, unknown>).readTimeMinutes,
    }));

    return NextResponse.json({ results: hits, found: result.found });
  } catch (err) {
    console.error('Typesense search error:', err);
    // Return empty — Fuse.js fallback handles it client-side
    return NextResponse.json({ results: [], found: 0 });
  }
}
