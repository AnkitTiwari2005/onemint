'use client';

import { useState } from 'react';
import { Search, BookA } from 'lucide-react';
import { motion } from 'framer-motion';

interface Term {
  id: string;
  slug: string;
  term: string;
  short_definition: string;
  full_definition?: string;
  category?: string;
}

export default function GlossaryClient({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState('');

  const filtered = terms.filter((t) =>
    t.term.toLowerCase().includes(query.toLowerCase()) ||
    (t.short_definition || '').toLowerCase().includes(query.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 min-h-screen bg-[var(--color-surface)]">
      <header className="bg-[var(--color-surface-alt)] py-12 lg:py-20 border-b border-[var(--color-border)]">
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookA className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-6" strokeWidth={1.5} />
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4">
            Financial Glossary
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl mx-auto mb-10 font-[family-name:var(--font-body)]">
            Demystifying finance, one term at a time. Search our comprehensive dictionary of financial jargon, acronyms, and concepts.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-tertiary)]" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a term (e.g. CAGR, SIP, Amortization)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-all shadow-sm"
            />
          </div>
          <p className="text-xs text-[var(--color-ink-tertiary)] mt-3">
            {terms.length} terms in the glossary
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-ink-secondary)] text-lg">No terms found matching &ldquo;{query}&rdquo;</p>
            <button onClick={() => setQuery('')} className="mt-4 text-[var(--color-accent)] font-semibold hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <h2 id={item.slug} className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-ink)]">
                    {item.term}
                  </h2>
                  {item.category && (
                    <span className="shrink-0 inline-block px-3 py-1 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink-tertiary)]">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-[var(--color-ink-secondary)] leading-relaxed font-[family-name:var(--font-body)]">
                  {item.full_definition || item.short_definition}
                </p>
                {item.full_definition && item.short_definition && item.full_definition !== item.short_definition && (
                  <p className="text-sm text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-ui)] italic">
                    {item.short_definition}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
