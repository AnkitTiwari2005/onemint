'use client';

import { useState } from 'react';
import { Search, BookA } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const glossaryTerms = [
  { term: 'Amortization', definition: 'The process of spreading out a loan into a series of fixed payments over time. You pay off the loan\'s principal and interest in different amounts each month.' },
  { term: 'Bull Market', definition: 'A financial market in which prices are rising or are expected to rise. Often characterized by investor optimism and confidence.' },
  { term: 'Bear Market', definition: 'A market condition in which the prices of securities are falling, and widespread pessimism causes the stock market\'s downward spiral to be self-sustaining.' },
  { term: 'CAGR', definition: 'Compound Annual Growth Rate. The mean annual growth rate of an investment over a specified period of time longer than one year. It represents one of the most accurate ways to calculate and determine returns.' },
  { term: 'Dividend', definition: 'A distribution of a portion of a company\'s earnings, decided by the board of directors, paid to a class of its shareholders.' },
  { term: 'EBITDA', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of a company\'s overall financial performance and is used as an alternative to net income.' },
  { term: 'Fiduciary', definition: 'A person or organization that acts on behalf of another person or persons, putting their clients\' interest ahead of their own, with a duty to preserve good faith and trust.' },
  { term: 'Index Fund', definition: 'A type of mutual fund or exchange-traded fund (ETF) with a portfolio constructed to match or track the components of a financial market index, such as the Nifty 50.' },
  { term: 'Liquidity', definition: 'The degree to which an asset or security can be quickly bought or sold in the market without affecting the asset\'s price.' },
  { term: 'Mutual Fund', definition: 'An investment program funded by shareholders that trades in diversified holdings and is professionally managed.' },
  { term: 'Net Worth', definition: 'The value of all the non-financial and financial assets owned by an individual or institution minus the value of all its outstanding liabilities.' },
  { term: 'Portfolio', definition: 'A collection of financial investments like stocks, bonds, commodities, cash, and cash equivalents, including closed-end funds and exchange-traded funds (ETFs).' },
  { term: 'ROI', definition: 'Return on Investment. A performance measure used to evaluate the efficiency or profitability of an investment or compare the efficiency of a number of different investments.' },
  { term: 'SIP', definition: 'Systematic Investment Plan. A facility offered by mutual funds to investors to invest in a disciplined manner. The investor invests a fixed amount of money at regular intervals.' },
  { term: 'Volatility', definition: 'A statistical measure of the dispersion of returns for a given security or market index. In most cases, the higher the volatility, the riskier the security.' },
  { term: 'Yield', definition: 'The income returned on an investment, such as the interest received from holding a security. The yield is usually expressed as an annual percentage rate.' },
].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  const [query, setQuery] = useState('');

  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(query.toLowerCase()) || 
    t.definition.toLowerCase().includes(query.toLowerCase())
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
              placeholder="Search for a term (e.g. CAGR, SIP)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_var(--color-accent-light)] transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-ink-secondary)] text-lg">No terms found matching "{query}"</p>
            <button 
              onClick={() => setQuery('')}
              className="mt-4 text-[var(--color-accent)] font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTerms.map((item, index) => (
              <motion.div 
                key={item.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-ink)] mb-3">
                  {item.term}
                </h2>
                <p className="text-[var(--color-ink-secondary)] leading-relaxed font-[family-name:var(--font-body)]">
                  {item.definition}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
