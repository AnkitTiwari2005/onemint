'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, Filter, Clock } from 'lucide-react';
import { articles } from '@/data/articles';
import { categories, getCategoryById } from '@/data/categories';
import { formatDate } from '@/lib/utils';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('onemint-recent-searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    }
  }, []);

  const results = query.length >= 2 
    ? articles.filter(a => {
        const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase()) || 
                             a.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || a.categoryId === categoryFilter;
        return matchesQuery && matchesCategory;
      })
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (typeof window !== 'undefined') {
      const prev = JSON.parse(localStorage.getItem('onemint-recent-searches') || '[]');
      const next = [query, ...prev.filter((s: string) => s !== query)].slice(0, 10);
      localStorage.setItem('onemint-recent-searches', JSON.stringify(next));
      setRecentSearches(next.slice(0, 5));
      
      // Update URL without reload
      window.history.replaceState(null, '', `?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      {/* Header */}
      <header className="bg-[var(--color-surface-alt)] py-12 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-ink-tertiary)]" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, tools, or topics..."
              className="w-full pl-16 pr-6 py-5 text-xl lg:text-2xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] focus:outline-none focus:border-[var(--color-accent)] font-[family-name:var(--font-ui)]"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--color-accent)] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-secondary)] whitespace-nowrap">
              <Filter size={16} /> Filter by:
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)]'}`}
              >
                All
              </button>
              {categories.slice(0, 5).map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Results */}
          <div className="lg:col-span-3">
            {query.length < 2 ? (
              <div className="text-center py-20">
                <SearchIcon size={48} className="mx-auto text-[var(--color-border)] mb-4" />
                <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Start typing to search</h2>
                <p className="text-[var(--color-ink-secondary)]">Find thousands of expert articles on money, health, and career.</p>
              </div>
            ) : results.length > 0 ? (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-8">
                  {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
                </h2>
                <div className="space-y-8">
                  {results.map((article) => {
                    const cat = getCategoryById(article.categoryId);
                    return (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col sm:flex-row gap-6 items-start">
                        <div className="relative w-full sm:w-64 aspect-video shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-alt)]">
                          <Image src={article.featuredImage} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div>
                          {cat && (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2" style={{ background: cat.lightColor, color: cat.accentColor }}>
                              {cat.name}
                            </span>
                          )}
                          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-[var(--color-ink-secondary)] line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--color-ink-tertiary)]">
                            <span>{formatDate(article.publishedAt)}</span>
                            <span>·</span>
                            <span>{article.readTimeMinutes} min read</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">No results found for "{query}"</h2>
                <p className="text-[var(--color-ink-secondary)]">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] pt-10 lg:pt-0 lg:pl-10">
            {recentSearches.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4 flex items-center gap-2">
                  <Clock size={16} /> Recent Searches
                </h3>
                <ul className="space-y-3">
                  {recentSearches.map(term => (
                    <li key={term}>
                      <button 
                        onClick={() => { setQuery(term); handleSearch({ preventDefault: () => {} } as React.FormEvent); }}
                        className="text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] hover:underline transition-colors text-left w-full"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['SIP', 'Tax Planning', 'AI', 'Health Checkup', 'Salary', 'Real Estate'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => { setQuery(tag); handleSearch({ preventDefault: () => {} } as React.FormEvent); }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-xs text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-[var(--color-ink-tertiary)]">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
