'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MarketItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  unit?: string;
}

// Static fallback — shown instantly while live data loads
const FALLBACK: MarketItem[] = [
  { symbol: 'NIFTY 50',   name: 'Nifty 50',    value: 22847.65, change: 0.84 },
  { symbol: 'SENSEX',     name: 'BSE Sensex',  value: 75310.42, change: 0.79 },
  { symbol: 'GOLD',       name: 'Gold',        value: 91450,    change: 0.32, unit: '₹/10g' },
  { symbol: 'USD/INR',    name: 'USD/INR',     value: 83.42,    change: -0.11 },
  { symbol: 'BTC',        name: 'Bitcoin',     value: 6824302,  change: 2.45, unit: '₹' },
  { symbol: 'NIFTY BANK', name: 'Bank Nifty',  value: 49182.30, change: 1.12 },
  { symbol: 'SILVER',     name: 'Silver',      value: 1048,     change: 0.58, unit: '₹/g' },
];

function formatValue(value: number, unit?: string): string {
  if (unit === '₹' && value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }
  return value.toFixed(2);
}

function TickerItem({ item }: { item: MarketItem }) {
  const isPositive = item.change > 0;
  const isNeutral = item.change === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-3 px-5 py-2 shrink-0">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
        {item.symbol}
      </span>
      <span className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {item.unit && item.unit !== '₹' ? '' : ''}{formatValue(item.value, item.unit)}
        {item.unit && item.unit !== '₹' ? ` ${item.unit}` : ''}
      </span>
      <div className={cn(
        'flex items-center gap-1 text-xs font-semibold font-[family-name:var(--font-ui)]',
        isPositive ? 'text-[var(--color-cat-finance)]' : isNeutral ? 'text-[var(--color-ink-tertiary)]' : 'text-[var(--color-accent-warm)]'
      )}>
        <Icon size={11} />
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {isPositive ? '+' : ''}{item.change.toFixed(2)}%
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
