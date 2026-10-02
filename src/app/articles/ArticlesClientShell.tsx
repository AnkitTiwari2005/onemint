'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

import type { PublicArticle } from '@/lib/articles';

interface Props {
  articles: PublicArticle[];       // All articles — for client-side filtering
  pageArticles: PublicArticle[];   // SSR slice for the current page
  currentPage: number;
  totalPages: number;
  totalCount: number;
  degraded: boolean;
}

const ALL = 'all';
const CLIENT_PAGE_SIZE = 24;

export default function ArticlesClientShell({
  articles,
  pageArticles,
  currentPage,
  totalPages,
  totalCount,
  degraded,
}: Props) {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  // When no filter is active, pagination is URL-driven (crawlable).
  // When a filter is active, we fall back to client-side "load more" in the same session.
  const [clientVisibleCount, setClientVisibleCount] = useState(CLIENT_PAGE_SIZE);

  // Sync category from URL param on mount (e.g. /articles?cat=personal-finance)
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Derive unique categories from ALL articles for the filter tabs
  const categories = Array.from(
    new Map(
      articles
        .filter((a) => a.categories)
        .map((a) => [a.categories!.id, a.categories!])
    ).values()
  );

  // Determine if any filter is active
  const isFiltering = activeCategory !== ALL || query.trim() !== '';

  // Apply client-side filtering over ALL articles when a filter is active
  const filtered = isFiltering
    ? articles.filter((a) => {
        const matchCat = activeCategory === ALL || a.category_id === activeCategory;
        const q = query.trim().toLowerCase();
        const matchQ =
          q === '' ||
          a.title.toLowerCase().includes(q) ||
          (a.tags ?? []).some((t) => t.toLowerCase().includes(q));
        return matchCat && matchQ;
      })
    : [];

  // Reset client pagination when filter changes
  const handleCategory = (id: string) => {
    setActiveCategory(id);
    setClientVisibleCount(CLIENT_PAGE_SIZE);
  };
  const handleSearch = (q: string) => {
    setQuery(q);
    setClientVisibleCount(CLIENT_PAGE_SIZE);
  };

  // What to actually render in the grid:
  // - Filtering active → use client-side filtered results
  // - No filter → use server-rendered page slice (SSR, crawlable)
  const displayArticles = isFiltering
    ? filtered.slice(0, clientVisibleCount)
    : pageArticles;

  const filteredHasMore = isFiltering && clientVisibleCount < filtered.length;

  // ── Pagination helpers (URL-based, only when no filter active) ──────────────
  function pageHref(p: number) {
    return p === 1 ? '/articles' : `/articles?page=${p}`;
  }

  // Generate page number range with ellipsis
  function pageRange(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  }

  return (
    <div className="pt-16 lg:pt-[72px] pb-28 md:pb-12">
      {/* Header */}
      <header className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] py-10 sm:py-16">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-3">
            All Articles
          </h1>
          <p className="text-[var(--color-ink-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {totalCount} in-depth guides across finance, technology, health, and more.
            {degraded && (
              <span className="block text-xs text-[var(--color-ink-tertiary)] mt-1">
                Showing cached content — some new articles may not appear.
              </span>
            )}
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-tertiary)]"
            />
            <input
              id="articles-search"
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] outline-none focus:border-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-8">
          <button
            id="filter-all"
            onClick={() => handleCategory(ALL)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border font-[family-name:var(--font-ui)] ${
              activeCategory === ALL
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            All ({articles.length})
          </button>
          {categories.map((cat) => {
            const count = articles.filter((a) => a.category_id === cat.id).length;
            if (count === 0) return null;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-${cat.slug}`}
                onClick={() => handleCategory(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border font-[family-name:var(--font-ui)]"
                style={{
                  background: active ? (cat.accent_color ?? 'var(--color-accent)') : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-ink-secondary)',
                  borderColor: active ? (cat.accent_color ?? 'var(--color-accent)') : 'var(--color-border)',
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-[var(--color-ink-tertiary)] mb-5 font-[family-name:var(--font-ui)]">
          {isFiltering
            ? `${filtered.length} ${filtered.length === 1 ? 'article' : 'articles'} found`
            : `Showing ${displayArticles.length} of ${totalCount} articles`}
          {!isFiltering && totalPages > 1 && (
            <span className="ml-2 text-[var(--color-ink-tertiary)]">— Page {currentPage} of {totalPages}</span>
          )}
        </p>

        {/* Article grid */}
        {displayArticles.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-lg text-[var(--color-ink)]">No articles found</p>
            <p className="text-sm mt-1">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {displayArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
                  layout
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group flex flex-col h-full bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
                  >
                    {article.cover_image && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={article.cover_image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={i < 3}
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-4 sm:p-5">
                      {article.categories && (
                        <span
                          className="inline-block self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                          style={{
                            background: article.categories.light_color ?? 'var(--color-surface-alt)',
                            color: article.categories.accent_color ?? 'var(--color-accent)',
                          }}
                        >
                          {article.categories.name}
                        </span>
                      )}
                      <h2 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[var(--color-ink)] line-clamp-2 mb-2 group-hover:text-[var(--color-accent)] transition-colors leading-snug flex-1">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-[var(--color-ink-secondary)] line-clamp-2 mb-4 font-[family-name:var(--font-body)] hidden sm:block">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border)]">
                        <span className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                          {article.published_at ? formatDate(article.published_at) : ''}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                          <Clock size={11} />
                          {article.read_time_minutes ?? 5} min
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Client-side Load More (only when filtering is active) ─────────── */}
        {filteredHasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setClientVisibleCount((c) => c + CLIENT_PAGE_SIZE)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
            >
              Load more · {filtered.length - clientVisibleCount} remaining
            </button>
          </div>
        )}

        {/* ── URL-based pagination (only when NO filter active — crawlable) ── */}
        {!isFiltering && totalPages > 1 && (
          <nav
            aria-label="Article pages"
            className="mt-12 flex flex-col items-center gap-4"
          >
            {/* Page number links — crawlable by bots */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {/* Prev */}
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  aria-label="Previous page"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
                >
                  <ChevronLeft size={14} /> Prev
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-tertiary)] opacity-40 cursor-not-allowed font-[family-name:var(--font-ui)]">
                  <ChevronLeft size={14} /> Prev
                </span>
              )}

              {/* Page numbers */}
              {pageRange(currentPage, totalPages).map((p, idx) =>
                p === '…' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-2 text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]"
                  >
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p as number)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? 'page' : undefined}
                    className={`min-w-[36px] text-center px-3 py-2 rounded-lg border text-sm font-semibold transition-colors font-[family-name:var(--font-ui)] ${
                      p === currentPage
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}

              {/* Next */}
              {currentPage < totalPages ? (
                <Link
                  href={pageHref(currentPage + 1)}
                  aria-label="Next page"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
                >
                  Next <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-tertiary)] opacity-40 cursor-not-allowed font-[family-name:var(--font-ui)]">
                  Next <ChevronRight size={14} />
                </span>
              )}
            </div>

            {/* SEO-friendly text links for bots that may not follow styled buttons */}
            <div className="flex items-center gap-3 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
              {currentPage > 1 && (
                <Link href={pageHref(currentPage - 1)} className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors">
                  <ArrowLeft size={11} /> Page {currentPage - 1}
                </Link>
              )}
              <span>Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages && (
                <Link href={pageHref(currentPage + 1)} className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors">
                  Page {currentPage + 1} <ArrowRight size={11} />
                </Link>
              )}
            </div>
          </nav>
        )}

        {/* Bottom CTA — only when all articles are shown and no more pages */}
        {!isFiltering && currentPage === totalPages && displayArticles.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
            >
              Browse by Topic <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Bottom CTA for filtered view when no more results */}
        {isFiltering && !filteredHasMore && filtered.length > 0 && (
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
