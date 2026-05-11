import { NextResponse } from 'next/server';
import { fetchPublishedArticles } from '@/lib/articles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await fetchPublishedArticles();
  return NextResponse.json(result);
}
