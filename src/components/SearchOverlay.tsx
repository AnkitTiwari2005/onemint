'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Clock, TrendingUp, BookOpen, Wrench, Hash } from 'lucide-react';
import { searchAll, SearchResult, SearchResultType } from '@/lib/search';
import { cn } from '@/lib/cn';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const popular = ['SIP Calculator', 'Income Tax 2026', 'AI Tools India', 'Health Insurance', 'Salary Negotiation', 'PPF vs NPS'];

const typeIcon: Record<SearchResultType, typeof BookOpen> = {
  article: BookOpen,
  tool: Wrench,
  category: Hash,
  glossary: Hash,
};

const typeLabel: Record<SearchResultType, string> = {
  article: 'Article',
  tool: 'Tool',
  category: 'Topic',
  glossary: 'Glossary',
};

const typeColor: Record<SearchResultType, string> = {
  article: 'var(--color-cat-finance)',
  tool: 'var(--color-cat-technology)',
  category: 'var(--color-cat-career)',
  glossary: 'var(--color-ink-tertiary)',
};

export function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('onemint-recent-searches');
        if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch { /* noop */ }
    }
  }, [isOpen]);

  // Focus input + lock scroll
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      return undefined;
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setQuery(''); setActiveIdx(-1); }, 200);
    }
  }, [isOpen]);

  const results: SearchResult[] = useMemo(() => searchAll(query), [query]);

  const saveRecent = (q: string) => {
    if (!q.trim()) return;
    try {
      const prev: string[] = JSON.parse(localStorage.getItem('onemint-recent-searches') || '[]');
      const next = [q.trim(), ...prev.filter(s => s !== q.trim())].slice(0, 10);
      localStorage.setItem('onemint-recent-searches', JSON.stringify(next));
      setRecentSearches(next.slice(0, 5));
    } catch { /* noop */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault();
      const r = results[activeIdx];
      saveRecent(query);
      onClose();
      router.push(r.href);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecent(query);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Search"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl mx-auto mt-[8vh] sm:mt-[12vh] bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-modal)] overflow-hidden"
            onClick={e => e.stopPropagation()}
            data-motion="true"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
              <SearchIcon size={20} className="text-[var(--color-ink-tertiary)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
                onKeyDown={handleKeyDown}
                placeholder="Search articles, tools, topics…"
                className="flex-1 bg-transparent text-[17px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] outline-none font-[family-name:var(--font-ui)]"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button onClick={() => setQuery('')} className="shrink-0 text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink)] transition-colors" aria-label="Clear">
                  <X size={16} />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <kbd className="text-[10px] text-[var(--color-ink-tertiary)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded border border-[var(--color-border)] font-[family-name:var(--font-ui)]">ESC</kbd>
              </div>
              <button onClick={onClose} className="sm:hidden" aria-label="Close search">
                <X size={20} className="text-[var(--color-ink-tertiary)]" />
              </button>
            </div>

            {/* Results / Empty State */}
            <div className="max-h-[65vh] overflow-y-auto p-3" aria-live="polite">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, i) => {
                    const Icon = typeIcon[result.type];
                    const isActive = i === activeIdx;
                    return (
                      <Link
                        key={`${result.type}-${result.href}`}
                        href={result.href}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl transition-colors',
                          isActive
                            ? 'bg-[var(--color-accent-light)]'
                            : 'hover:bg-[var(--color-surface-alt)]'
                        )}
                      >
                        {/* Type icon */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${typeColor[result.type]}18`, color: typeColor[result.type] }}
                        >
                          <Icon size={15} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[var(--color-ink)] line-clamp-1 font-[family-name:var(--font-ui)]">
                            {result.title}
                          </div>
                          {result.excerpt && (
                            <div className="text-xs text-[var(--color-ink-tertiary)] mt-0.5 line-clamp-1 font-[family-name:var(--font-ui)]">
                              {result.excerpt}
                            </div>
                          )}
                        </div>

                        <span
                          className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-[family-name:var(--font-ui)]"
                          style={{ background: `${typeColor[result.type]}18`, color: typeColor[result.type] }}
                        >
                          {typeLabel[result.type]}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">🔍</div>
                  <p className="text-[var(--color-ink-secondary)] font-semibold font-[family-name:var(--font-ui)]">No results for &quot;{query}&quot;</p>
                  <p className="text-[var(--color-ink-tertiary)] text-sm mt-1 font-[family-name:var(--font-ui)]">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-6 p-2">
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-ui)]">
                        <Clock size={11} /> Recent Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map(s => (
                          <button key={s} onClick={() => setQuery(s)}
                            className="px-3 py-1.5 text-sm rounded-full bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors font-[family-name:var(--font-ui)]">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-ui)]">
                      <TrendingUp size={11} /> Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popular.map(s => (
                        <button key={s} onClick={() => setQuery(s)}
                          className="px-3 py-1.5 text-sm rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:opacity-80 transition-opacity font-[family-name:var(--font-ui)]">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
              <span>↑↓ navigate · Enter select</span>
              <span>{results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
