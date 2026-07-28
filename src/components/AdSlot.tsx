'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /** Unique ad slot ID from your AdSense account e.g. "1234567890" */
  slotId?: string;
  /**
   * Layout format:
   *  auto        — responsive display (default)
   *  fluid       — in-article / native
   *  rectangle   — fixed rectangle
   *  autorelaxed — multiplex / content recommendation grid
   *  infeed      — in-feed native (requires layout="in-article" sibling)
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'autorelaxed' | 'infeed';
  /** Optional label shown above ad */
  label?: string;
  className?: string;
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"

/**
 * AdSlot — renders a Google AdSense ad unit.
 *
 * Supports Display, In-article, In-feed, and Multiplex (autorelaxed) formats.
 * In development: renders a labelled placeholder box — no real ads shown.
 * In production without PUB_ID or slotId: renders nothing (fail-safe).
 */
export function AdSlot({ slotId, format = 'auto', label = 'Advertisement', className = '' }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!PUB_ID || !slotId || pushed.current) return;
    pushed.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch { /* AdSense not loaded yet */ }
  }, [slotId]);

  // Development mode — placeholder so layout can be validated without real ads
  if (process.env.NODE_ENV !== 'production') {
    const formatLabel: Record<string, string> = {
      auto:        'Display',
      fluid:       'In-article / Fluid',
      rectangle:   'Rectangle',
      autorelaxed: 'Multiplex',
      infeed:      'In-feed',
    };
    return (
      <div
        className={className}
        style={{
          border: '2px dashed #D97706',
          borderRadius: 8,
          padding: '16px',
          textAlign: 'center',
          background: '#FFFBEB',
          margin: '24px 0',
          minHeight: format === 'autorelaxed' ? 280 : 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: '#92400E', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ad Placeholder
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: '#B45309', margin: 0 }}>
          {label} · {formatLabel[format] ?? format} · slot: {slotId ?? 'not set'}
        </p>
      </div>
    );
  }

  // No pub ID or slot configured — render nothing
  if (!PUB_ID || !slotId) return null;

  // Multiplex (autorelaxed) — uses data-ad-format="autorelaxed", no responsive attr
  if (format === 'autorelaxed') {
    return (
      <div className={className} style={{ margin: '32px 0' }} aria-label="Advertisement">
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, textAlign: 'center' }}>
          Advertisement
        </p>
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={PUB_ID}
          data-ad-slot={slotId}
          data-ad-format="autorelaxed"
        />
      </div>
    );
  }

  // Standard display / fluid / rectangle / infeed
  return (
    <div className={className} style={{ margin: '24px 0', textAlign: 'center' }} aria-label="Advertisement">
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Advertisement
      </p>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slotId}
        data-ad-format={format === 'infeed' ? 'fluid' : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
