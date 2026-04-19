'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTerm {
  term: string;
  definition: string;
  slug: string;
}

const mockGlossary: Record<string, GlossaryTerm> = {
  'sip': { term: 'SIP', definition: 'Systematic Investment Plan. A method of investing a fixed sum regularly in a mutual fund scheme.', slug: 'sip' },
  'cagr': { term: 'CAGR', definition: 'Compound Annual Growth Rate. The mean annual growth rate of an investment over a specified period of time.', slug: 'cagr' },
  'inflation': { term: 'Inflation', definition: 'The rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling.', slug: 'inflation' },
  'nifty': { term: 'Nifty 50', definition: 'A benchmark Indian stock market index that represents the weighted average of 50 of the largest Indian companies.', slug: 'nifty-50' },
};

export function GlossaryTooltip({ term, children }: { term: string; children: ReactNode }) {
  const glossaryData = mockGlossary[term.toLowerCase()];

  if (!glossaryData) return <>{children}</>;

  return (
    <RadixTooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <span className="cursor-help underline decoration-dashed decoration-[var(--color-ink-tertiary)] underline-offset-4 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)] transition-colors">
            {children}
          </span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={8}
            className="z-50 w-72 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] p-4 data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <div className="flex flex-col gap-2">
              <h4 className="font-[family-name:var(--font-heading)] font-semibold text-[var(--color-ink)] text-base">
                {glossaryData.term}
              </h4>
              <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] leading-relaxed">
                {glossaryData.definition}
              </p>
              <Link 
                href={`/glossary/${glossaryData.slug}`}
                className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-warm)] transition-colors mt-1"
              >
                See full definition →
              </Link>
            </div>
            <RadixTooltip.Arrow className="fill-[var(--color-surface)] stroke-[var(--color-border)]" strokeWidth={1} width={16} height={8} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
