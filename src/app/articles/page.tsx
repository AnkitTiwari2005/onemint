'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Search } from 'lucide-react';
import { articles } from '@/data/articles';
import { categories, getCategoryById } from '@/data/categories';
import { formatDate } from '@/lib/utils';

const ALL = 'all';

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [query, setQuery] = useState('');

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === ALL || a.categoryId === activeCategory;
    const matchQ =
      query.trim() === '' ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQ;
  });

  return (
    <div className="pt-16 lg:pt-[72px] pb-28 md:pb-12">
      {/* Header */}
      <header className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] py-10 sm:py-16">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-3">
            All Articles
          </h1>
          <p className="text-[var(--color-ink-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {articles.length} in-depth guides across finance, technology, health, and more.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] outline-none focus:border-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-8">
          <button
            onClick={() => setActiveCategory(ALL)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border font-[family-name:var(--font-ui)] ${
              activeCategory === ALL
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            All ({articles.length})
          </button>
          {categories.map((cat) => {
            const count = articles.filter((a) => a.categoryId === cat.id).length;
            if (count === 0) return null;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border font-[family-name:var(--font-ui)]"
                style={{
                  background: active ? cat.accentColor : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-ink-secondary)',
                  borderColor: active ? cat.accentColor : 'var(--color-border)',
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-[var(--color-ink-tertiary)] mb-5 font-[family-name:var(--font-ui)]">
          {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found
        </p>

        {/* Article grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-lg text-[var(--color-ink)]">No articles found</p>
            <p className="text-sm mt-1">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((article, i) => {
              const cat = getCategoryById(article.categoryId);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col h-full bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={i < 3}
                      />
                    </div>
                    <div className="flex flex-col flex-1 p-4 sm:p-5">
                      {cat && (
                        <span
                          className="inline-block self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                          style={{ background: cat.lightColor, color: cat.accentColor }}
                        >
                          {cat.name}
                        </span>
                      )}
                      <h2 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[var(--color-ink)] line-clamp-2 mb-2 group-hover:text-[var(--color-accent)] transition-colors leading-snug flex-1">
                        {article.title}
                      </h2>
                      <p className="text-sm text-[var(--color-ink-secondary)] line-clamp-2 mb-4 font-[family-name:var(--font-body)] hidden sm:block">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                          <Clock size={11} />
                          {article.readTimeMinutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
            >
              Browse by Topic <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
