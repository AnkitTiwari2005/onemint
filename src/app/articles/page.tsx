import { fetchPublishedArticles } from '@/lib/articles';
import ArticlesClientShell from './ArticlesClientShell';

// ISR: cache the articles list for 60 seconds — new articles appear within 1 minute.
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

export const metadata = {
  title: 'All Articles | OneMint',
  description: 'In-depth guides across finance, technology, health, career, and more — from OneMint.',
  alternates: { canonical: `${SITE_URL}/articles` },
};

export default async function ArticlesPage() {
  const { articles, degraded } = await fetchPublishedArticles();

  return (
    <ArticlesClientShell
      articles={articles}
      totalCount={articles.length}
      degraded={degraded}
    />
  );
}
