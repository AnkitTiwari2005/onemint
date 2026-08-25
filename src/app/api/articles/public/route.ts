import { NextResponse } from 'next/server';
import { fetchPublishedArticles } from '@/lib/articles';

// Cached for 60s — was force-dynamic (uncached), meaning every /saved page
// visit re-queried the entire article catalog fresh from Supabase.
export const revalidate = 60;

export async function GET() {
  const result = await fetchPublishedArticles();
  return NextResponse.json(result);
}

