'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ArticleViewTrackerProps {
  slug: string;
  /** If true, shows the view count badge inline */
  showCount?: boolean;
}

/**
 * ArticleViewTracker — two jobs in one component:
 *  1. Fires POST /api/articles/view?slug=xxx on mount to increment counter
 *  2. Fetches + displays the view count if showCount=true
 *
 * Both operations are fire-and-forget; errors never surface to the user.
 */
export function ArticleViewTracker({ slug, showCount = true }: ArticleViewTrackerProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Fire-and-forget increment
    fetch(`/api/articles/view?slug=${encodeURIComponent(slug)}`, { method: 'POST' })
      .catch(() => {});

    if (!showCount) return;

    // Fetch count for display (separate from increment so cached GET is fast)
    fetch(`/api/articles/view?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => { if (typeof data.count === 'number') setCount(data.count); })
      .catch(() => {});
  }, [slug, showCount]);

  if (!showCount || count === null) return null;

  // Format: 1234 → "1.2k", 12345 → "12k"
  const formatted = count >= 1000
    ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
    : String(count);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        color: 'var(--color-ink-tertiary)',
        fontWeight: 500,
      }}
      title={`${count.toLocaleString('en-IN')} views`}
    >
      <Eye size={13} />
      {formatted} views
    </span>
  );
}
