'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MarketItem {
  symbol: string;
  name: string;
  value: number | null;
  change: number | null;
  unit?: string;
}

// Neutral placeholder — shown until real data arrives from /api/market-data
const FALLBACK: MarketItem[] = [
  { symbol: 'NIFTY 50',   name: 'Nifty 50',    value: null, change: null },
  { symbol: 'SENSEX',     name: 'BSE Sensex',  value: null, change: null },
  { symbol: 'GOLD',       name: 'Gold',        value: null, change: null, unit: '₹/10g' },
  { symbol: 'USD/INR',    name: 'USD/INR',     value: null, change: null },
  { symbol: 'BTC',        name: 'Bitcoin',     value: null, change: null, unit: '₹' },
  { symbol: 'NIFTY BANK', name: 'Bank Nifty',  value: null, change: null },
  { symbol: 'SILVER',     name: 'Silver',      value: null, change: null, unit: '₹/g' },
];

function formatValue(value: number | null, unit?: string): string {
  if (value === null || value === undefined) return '—';
  if (unit === '₹' && value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  return value.toFixed(2);
}

function TickerItem({ item }: { item: MarketItem }) {
  const isPositive = item.change !== null && item.change > 0;
  const isNeutral = item.change === null || item.change === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-3 px-5 py-2 shrink-0">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
        {item.symbol}
      </span>
      <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatValue(item.value, item.unit)}
        {item.value !== null && item.unit && item.unit !== '₹' ? ` ${item.unit}` : ''}
      </span>
      <div className={cn(
        'flex items-center gap-1 text-xs font-semibold font-[family-name:var(--font-ui)]',
        isPositive ? 'text-[var(--color-cat-finance)]' : isNeutral ? 'text-[var(--color-ink-tertiary)]' : 'text-[var(--color-accent-warm)]'
      )}>
        <Icon size={11} />
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {item.change !== null ? `${isPositive ? '+' : ''}${item.change.toFixed(2)}%` : '—'}
        </span>
      </div>
      {/* Separator dot */}
      <span className="text-[var(--color-border-strong)] select-none">·</span>
    </div>
  );
}

export function MarketTicker() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<MarketItem[]>(FALLBACK);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Fetch live data — refreshes USD/INR with Alpha Vantage; 15 min cache on server
    fetch('/api/market-data')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setData(d); })
      .catch(() => {}); // Silently fall back to static data
  }, []);

  if (!mounted) return null;

  // Duplicate for seamless loop
  const items = [...data, ...data];

  return (
    <div
      className="market-ticker overflow-hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] py-0"
      aria-label="Live market data"
    >
      <div className="flex items-center">
        {/* LIVE label */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[var(--color-cat-finance)] text-white z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white pulse-live" />
          <span className="text-[10px] font-bold uppercase tracking-widest font-[family-name:var(--font-ui)]">Markets</span>
        </div>

        {/* Scrolling track */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-track">
            {items.map((item, i) => (
              <TickerItem key={`${item.symbol}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
