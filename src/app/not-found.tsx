import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import NotFoundClient from './not-found-client';
import { ENV } from '@/lib/env';


// 404 pages should never be indexed.
export const metadata: Metadata = {
  title: '404 — Page Not Found — OneMint',
  robots: { index: false, follow: true },
};

// Fetch a small set of recent articles to power the smart suggestions on the 404 page.
// Uses the service role key so it works even if RLS is enabled.
// Fails gracefully — if Supabase is unavailable, renders the 404 page without suggestions.
async function getRecentArticles() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;
    if (!url || !key) return [];


    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, category_id, read_time_minutes')
      .order('published_at', { ascending: false })
      .limit(50); // Fetch 50 most recent — keyword matcher picks the best 3

    if (error || !data) return [];

    // Normalise snake_case DB fields → camelCase Article shape
    return data.map((row: Record<string, unknown>) => ({
      slug:             String(row.slug ?? ''),
      title:            String(row.title ?? ''),
      categoryId:       String(row.category_id ?? ''),
      readTimeMinutes:  Number(row.read_time_minutes ?? 5),
    }));
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const articles = await getRecentArticles();
  return <NotFoundClient articles={articles} />;
}
