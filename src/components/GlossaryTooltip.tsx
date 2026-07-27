'use client';

import { ReactNode, useState, useCallback } from 'react';
import Link from 'next/link';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { glossaryTerms } from '@/data/glossary';
import { ArrowRight, BookOpen } from 'lucide-react';

// ── Full data lookup map: term id → GlossaryTerm ─────────────────────────────
const glossaryMap: Record<string, typeof glossaryTerms[0]> = {};
for (const t of glossaryTerms) {
  glossaryMap[t.id.toLowerCase()] = t;
  // Also index by abbreviation (e.g. "sip" from "SIP (Systematic...)")
  const abbr = t.term.match(/^([A-Z]{2,})\s*\(/);
  if (abbr) glossaryMap[abbr[1].toLowerCase()] = t;
}

// ── Per-category color palettes ───────────────────────────────────────────────
const CAT_PALETTE: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  'Investing':   { bg: '#EFF6FF', text: '#1D4ED8', accent: '#2563EB', border: '#BFDBFE' },
  'Tax & Legal': { bg: '#FFFBEB', text: '#92400E', accent: '#D97706', border: '#FDE68A' },
  'Saving':      { bg: '#F0FDF4', text: '#166534', accent: '#16A34A', border: '#BBF7D0' },
  'Insurance':   { bg: '#FDF4FF', text: '#7E22CE', accent: '#9333EA', border: '#E9D5FF' },
  'Retirement':  { bg: '#F5F3FF', text: '#5B21B6', accent: '#7C3AED', border: '#DDD6FE' },
  'Economics':   { bg: '#FFF7ED', text: '#9A3412', accent: '#EA580C', border: '#FED7AA' },
  'Loans':       { bg: '#FFF1F2', text: '#9F1239', accent: '#E11D48', border: '#FECDD3' },
  'Markets':     { bg: '#F0FDFA', text: '#134E4A', accent: '#0D9488', border: '#99F6E4' },
  'Employment':  { bg: '#F0F9FF', text: '#075985', accent: '#0284C7', border: '#BAE6FD' },
};

function getPalette(cat: string) {
  return CAT_PALETTE[cat] ?? { bg: '#F3F4F6', text: '#374151', accent: '#6B7280', border: '#E5E7EB' };
}

// Try to resolve a related term name to a glossary id for linking
function resolveRelatedId(name: string): string | null {
  const normalized = name.toLowerCase().trim();
  // Direct id match
  if (glossaryMap[normalized]) return glossaryMap[normalized].id;
  // Partial match — find term whose base name (without parenthetical) equals the related name
  const found = glossaryTerms.find(t => {
    const base = t.term.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
    return base === normalized || t.term.toLowerCase() === normalized;
  });
  return found?.id ?? null;
}

// ── GlossaryTooltip Component ─────────────────────────────────────────────────

export function GlossaryTooltip({ term, children }: { term: string; children: ReactNode }) {
  const data = glossaryMap[term.toLowerCase()];
  const [open, setOpen] = useState(false);

  // Touch: toggle on tap, prevent mouse-emulated events from also firing
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      setOpen(o => !o);
    }
  }, []);

  // Keyboard: Enter / Space toggles tooltip
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(o => !o);
    }
    if (e.key === 'Escape') setOpen(false);
  }, []);

  if (!data) return <>{children}</>;

  const pal = getPalette(data.category);
  // Show up to 3 related terms
  const related = (data.relatedTerms ?? []).slice(0, 3);

  return (
    <RadixTooltip.Provider delayDuration={150} skipDelayDuration={50}>
      <RadixTooltip.Root open={open} onOpenChange={setOpen}>

        {/* ── Trigger ── */}
        <RadixTooltip.Trigger asChild>
          <span
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Definition of ${data.term}`}
            aria-expanded={open}
            style={{
              display: 'inline',
              cursor: 'help',
              paddingBottom: 1,
              borderBottom: `1.5px dashed ${pal.accent}`,
              color: 'inherit',
              outline: 'none',
              borderRadius: 2,
              transition: 'background 0.12s, border-bottom-style 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `${pal.accent}12`;
              (e.currentTarget as HTMLElement).style.borderBottomStyle = 'solid';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderBottomStyle = 'dashed';
            }}
            onFocus={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${pal.accent}40`;
            }}
            onBlur={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {children}
          </span>
        </RadixTooltip.Trigger>

        {/* ── Tooltip Panel ── */}
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={10}
            collisionPadding={16}
            avoidCollisions
            onPointerDownOutside={() => setOpen(false)}
            className={[
              'z-[200]',
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
              'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
            ].join(' ')}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: 300,
              maxWidth: 'calc(100vw - 2rem)',
              overflow: 'hidden',
            }}
          >
            {/* ── Colored category stripe at top ── */}
            <div style={{
              height: 3,
              background: `linear-gradient(90deg, ${pal.accent}, ${pal.accent}80)`,
            }} />

            <div style={{ padding: '14px 16px 16px' }}>

              {/* ── Header: term name + category badge ── */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--color-ink)',
                  lineHeight: 1.25,
                  margin: 0,
                  flex: 1,
                }}>
                  {data.term}
                </h4>
                <span style={{
                  flexShrink: 0,
                  fontSize: 9,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 20,
                  background: pal.bg,
                  color: pal.text,
                  border: `1px solid ${pal.border}`,
                  whiteSpace: 'nowrap',
                  lineHeight: 1.6,
                }}>
                  {data.category}
                </span>
              </div>

              {/* ── Short definition ── */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--color-ink-secondary)',
                lineHeight: 1.65,
                margin: 0,
              }}>
                {data.shortDefinition}
              </p>

              {/* ── Example callout (when available) ── */}
              {data.example && (
                <div style={{
                  marginTop: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: `${pal.accent}0D`,
                  borderLeft: `2.5px solid ${pal.accent}`,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11.5,
                    color: 'var(--color-ink-secondary)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}>
                    <span style={{ fontWeight: 700, color: pal.text }}>e.g. </span>
                    {data.example}
                  </p>
                </div>
              )}

              {/* ── Related terms chips ── */}
              {related.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600,
                    color: 'var(--color-ink-tertiary)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginRight: 2,
                  }}>
                    See also
                  </span>
                  {related.map(r => {
                    const relId = resolveRelatedId(r);
                    return relId ? (
                      <Link
                        key={r}
                        href={`/glossary/${relId}`}
                        onClick={() => setOpen(false)}
                        style={{
                          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
                          padding: '2px 9px', borderRadius: 20,
                          background: 'var(--color-surface-alt)',
                          color: pal.accent,
                          border: `1px solid ${pal.border}`,
                          textDecoration: 'none',
                          transition: 'background 0.12s',
                        }}
                      >
                        {r}
                      </Link>
                    ) : (
                      <span key={r} style={{
                        fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
                        padding: '2px 9px', borderRadius: 20,
                        background: 'var(--color-surface-alt)',
                        color: 'var(--color-ink-tertiary)',
                        border: '1px solid var(--color-border)',
                      }}>
                        {r}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* ── Footer: branding + full definition link ── */}
              <div style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-ui)', fontSize: 11,
                  color: 'var(--color-ink-tertiary)',
                }}>
                  <BookOpen size={11} />
                  OneMint Glossary
                </span>
                <Link
                  href={`/glossary/${data.id}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
                    color: pal.accent,
                    textDecoration: 'none',
                    transition: 'opacity 0.12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.75')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
                >
                  Full definition <ArrowRight size={12} />
                </Link>
              </div>

            </div>

            {/* Radix arrow */}
            <RadixTooltip.Arrow
              style={{ fill: 'var(--color-surface)', stroke: 'var(--color-border)' }}
              strokeWidth={1}
              width={16}
              height={8}
            />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>

      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
