'use client';

import { cn } from '@/lib/cn';

// ─── Base Skeleton ─────────────────────────────────────────────────────────────
interface SkeletonBaseProps {
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  none: '',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

function SkeletonBase({ className, rounded = 'md' }: SkeletonBaseProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-[var(--color-surface-alt)] animate-shimmer',
        roundedMap[rounded],
        className
      )}
    />
  );
}

// ─── Text Lines ───────────────────────────────────────────────────────────────
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-1/2', 'w-1/3'];

  return (
    <div aria-hidden="true" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn('h-4', widths[i % widths.length])}
          rounded="sm"
        />
      ))}
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('space-y-3', className)}>
      {/* Image 16:9 */}
      <SkeletonBase className="w-full aspect-video" rounded="lg" />
      {/* Category pill */}
      <SkeletonBase className="h-5 w-20" rounded="full" />
      {/* Title */}
      <div className="space-y-2">
        <SkeletonBase className="h-5 w-full" rounded="sm" />
        <SkeletonBase className="h-5 w-4/5" rounded="sm" />
      </div>
      {/* Excerpt */}
      <SkeletonBase className="h-4 w-3/4" rounded="sm" />
      {/* Author row */}
      <div className="flex items-center gap-2 pt-1">
        <SkeletonBase className="h-8 w-8 shrink-0" rounded="full" />
        <SkeletonBase className="h-4 w-24" rounded="sm" />
        <SkeletonBase className="h-4 w-16 ml-auto" rounded="sm" />
      </div>
    </div>
  );
}

// ─── Hero (full-width split) ──────────────────────────────────────────────────
function SkeletonHero({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6', className)}>
      {/* Main hero image */}
      <SkeletonBase className="w-full h-[480px]" rounded="lg" />
      {/* Secondary stack */}
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <SkeletonBase className="h-3 w-20" rounded="full" />
            <div className="space-y-1.5">
              <SkeletonBase className="h-4 w-full" rounded="sm" />
              <SkeletonBase className="h-4 w-4/5" rounded="sm" />
            </div>
            <SkeletonBase className="h-3 w-16" rounded="sm" />
            {i < 3 && <SkeletonBase className="h-px w-full mt-4" rounded="none" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Market Ticker Pills ──────────────────────────────────────────────────────
function SkeletonTicker({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBase key={i} className="h-7 w-28 shrink-0" rounded="full" />
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBase key={i} className="h-9 flex-1" rounded="md" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonBase key={j} className="h-8 flex-1" rounded="sm" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Compose & Export ─────────────────────────────────────────────────────────
export const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Card: SkeletonCard,
  Hero: SkeletonHero,
  Ticker: SkeletonTicker,
  Table: SkeletonTable,
});
