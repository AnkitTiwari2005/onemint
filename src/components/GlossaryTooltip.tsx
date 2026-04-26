'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { glossaryTerms } from '@/data/glossary';

// Build a lookup map from all glossary terms (by id and normalized term name)
const glossaryMap: Record<string, { term: string; shortDefinition: string; id: string }> = {};
for (const t of glossaryTerms) {
  glossaryMap[t.id.toLowerCase()] = { term: t.term, shortDefinition: t.shortDefinition, id: t.id };
  glossaryMap[t.term.toLowerCase()] = { term: t.term, shortDefinition: t.shortDefinition, id: t.id };
  // Also add abbreviated forms (e.g. "sip" from "SIP (Systematic...)")
  const abbr = t.term.match(/^([A-Z]+)\s*\(/);
  if (abbr) {
    glossaryMap[abbr[1].toLowerCase()] = { term: t.term, shortDefinition: t.shortDefinition, id: t.id };
  }
}

export function GlossaryTooltip({ term, children }: { term: string; children: ReactNode }) {
  const data = glossaryMap[term.toLowerCase()];

  if (!data) return <>{children}</>;

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
                {data.term}
              </h4>
              <p className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-body)] leading-relaxed">
                {data.shortDefinition}
              </p>
              <Link
                href={`/glossary/${data.id}`}
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
