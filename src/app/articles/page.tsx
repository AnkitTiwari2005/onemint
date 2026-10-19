import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchPublishedArticles, staticArticles, staticToPublic, type PublicArticle } from '@/lib/articles';
import ArticlesClientShell from './ArticlesClientShell';

// ISR: cache the articles list for 60 seconds — new articles appear within 1 minute.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.com';
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
    title: isFirstPage ? 'All Articles' : `All Articles — Page ${pageNum}`,
    description: 'In-depth guides across finance, technology, health, career, and more — from OneMint.',
    alternates: {
      canonical: isFirstPage ? `${SITE_URL}/articles` : `${SITE_URL}/articles?page=${pageNum}`,
    },
    robots: isFirstPage ? undefined : { index: false, follow: true },
  };
}

function ArticlesSkeleton() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-28">
      <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] py-10 sm:py-16 text-center">
        <div className="h-10 w-48 bg-[var(--color-border)] rounded-xl mx-auto mb-4 animate-pulse" />
        <div className="h-5 w-72 bg-[var(--color-border)] rounded mx-auto animate-pulse" />
      </div>
    </div>
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);

  let articles: PublicArticle[] = [];
  let degraded = false;
  try {
    const res = await fetchPublishedArticles();
    articles = res.articles || [];
    degraded = res.degraded;
  } catch (err) {
    console.error('[ArticlesPage] Failed to fetch articles:', err);
    articles = staticArticles.map(staticToPublic);
    degraded = true;
  }

  const totalCount = articles.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const safePage = Math.min(pageNum, totalPages || 1);
  const pageSlice = articles.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesClientShell
        articles={articles}
        pageArticles={pageSlice}
        currentPage={safePage}
        totalPages={totalPages}
        totalCount={totalCount}
        degraded={degraded}
      />
    </Suspense>
  );
}
