import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/tags
 * Returns popular tag names ranked by article count.
 * Used by the search page for tag suggestions.
 * Public, read-only, no auth required.
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ tags: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('tags')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (error || !data) {
      return NextResponse.json({ tags: [] });
    }

    // Count tag occurrences across all published articles
    const tagCounts: Record<string, number> = {};
    for (const row of data) {
      const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim()) {
          tagCounts[tag.trim()] = (tagCounts[tag.trim()] || 0) + 1;
        }
      }
    }

    // Return top tags sorted by frequency (descending)
    const tags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 20);

    const res = NextResponse.json({ tags });
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
  } catch (err) {
    console.error('[/api/tags]', err);
    return NextResponse.json({ tags: [] });
  }
}
