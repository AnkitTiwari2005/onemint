import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/data/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getArticlesByCategory } from '@/data/articles';

export const metadata = {
  title: 'All Topics',
  description: 'Explore our comprehensive guides and articles across personal finance, technology, health, career, and more.',
};

export default function TopicsHubPage() {
  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      <header className="bg-[var(--color-surface-alt)] py-12 lg:py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4">
            Explore All Topics
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl mx-auto">
            Deep dives, expert advice, and practical guides to help you navigate your money, health, career, and life in India.
          </p>
        </div>
      </header>

      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const topArticles = getArticlesByCategory(cat.id).slice(0, 3);
            return (
              <div key={cat.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span style={{ color: cat.accentColor }}><CategoryIcon categoryId={cat.id} size={32} /></span>
                    <div>
                      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold" style={{ color: cat.accentColor }}>
                        {cat.name}
                      </h2>
                      <span className="text-xs font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wider">
                        {cat.articleCount.toLocaleString()} Articles
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-ink-secondary)] mb-6 h-10">
                  {cat.description}
                </p>

                {topArticles.length > 0 && (
                  <div className="space-y-4 mb-6 pt-4 border-t border-[var(--color-border)]">
                    {topArticles.map((article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
                        <h3 className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}

                <Link href={`/topics/${cat.slug}`} 
                  className="inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: cat.lightColor, color: cat.accentColor }}>
                  View All {cat.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
