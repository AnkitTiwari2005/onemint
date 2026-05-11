import { fetchPublishedArticles } from '@/lib/articles';
import ArticlesClientShell from './ArticlesClientShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Articles | OneMint',
  description: 'In-depth guides across finance, technology, health, career, and more — from OneMint.',
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
