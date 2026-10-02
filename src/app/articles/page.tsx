import type { Metadata } from 'next';
import { fetchPublishedArticles } from '@/lib/articles';
import ArticlesClientShell from './ArticlesClientShell';

// ISR: cache the articles list for 60 seconds — new articles appear within 1 minute.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
const PAGE_SIZE = 24; // articles per crawlable page

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);
  const isFirstPage = pageNum === 1;

  return {
    title: isFirstPage ? 'All Articles | OneMint' : `All Articles — Page ${pageNum} | OneMint`,
    description: 'In-depth guides across finance, technology, health, career, and more — from OneMint.',
    alternates: {
      canonical: isFirstPage ? `${SITE_URL}/articles` : `${SITE_URL}/articles?page=${pageNum}`,
    },
    // Only page 1 is the authoritative index — subsequent pages are supplementary
    robots: isFirstPage ? undefined : { index: false, follow: true },
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);

  const { articles, degraded } = await fetchPublishedArticles();

  // Slice for the current page — passed to client shell as "initial" page
  const totalCount = articles.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const safePage = Math.min(pageNum, totalPages || 1);
  const pageSlice = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <ArticlesClientShell
      articles={articles}        // ALL articles for client-side filter/search
      pageArticles={pageSlice}   // only this page's articles for initial SSR render
      currentPage={safePage}
      totalPages={totalPages}
      totalCount={totalCount}
      degraded={degraded}
    />
  );
}
