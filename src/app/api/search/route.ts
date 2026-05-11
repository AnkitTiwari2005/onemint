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
  } catch (err) {
    console.error('Typesense search error:', err);
    // Return degraded flag — client can show "Search temporarily unavailable"
    return NextResponse.json(
      { results: [], found: 0, degraded: true },
      { status: 200 }
    );
  }
}
