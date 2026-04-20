import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/data/articles';
import { Hash } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse All Tags',
  description: 'Explore OneMint articles by topic tag. Find content on SIP, mutual funds, AI, health, salary negotiation, and more.',
};

function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function TagsPage() {
  // Count articles per tag
  const tagCounts: Record<string, number> = {};
  articles.forEach((article) => {
    article.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const allTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...allTags.map(([, c]) => c));
  const minCount = Math.min(...allTags.map(([, c]) => c));

  // Font size: 13px–28px scaled by count
  function fontSize(count: number): number {
    if (maxCount === minCount) return 18;
    return Math.round(13 + ((count - minCount) / (maxCount - minCount)) * 15);
  }

  // Group alphabetically
  const grouped: Record<string, [string, number][]> = {};
  allTags.forEach(([tag, count]) => {
    const letter = tag[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push([tag, count]);
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Hash size={20} color="white" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            Browse by Tag
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-secondary)', fontSize: 16, margin: 0 }}>
          {allTags.length} tags across {articles.length} articles. Larger tags have more articles.
        </p>
      </div>

      {/* Tag Cloud */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '32px',
          marginBottom: 48,
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: 12,
          alignItems: 'center',
          lineHeight: 2,
        }}
      >
        {allTags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tag/${slugifyTag(tag)}`}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: fontSize(count),
              fontWeight: count >= maxCount * 0.7 ? 600 : 400,
              color: count >= maxCount * 0.7 ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
              textDecoration: 'none',
              padding: '2px 6px',
              borderRadius: 4,
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={`${count} article${count !== 1 ? 's' : ''}`}
          >
            #{tag}
            <span
              style={{
                fontSize: 10,
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1px 5px',
                fontWeight: 600,
                color: 'var(--color-ink-tertiary)',
                verticalAlign: 'middle',
              }}
            >
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Alphabetical Group */}
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-ink)',
          marginBottom: 24,
          paddingBottom: 12,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        All Tags — A to Z
      </h2>

      {Object.keys(grouped)
        .sort()
        .map((letter) => (
          <div key={letter} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-accent)',
                marginBottom: 10,
              }}
            >
              {letter}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {grouped[letter].sort((a, b) => a[0].localeCompare(b[0])).map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tag/${slugifyTag(tag)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'var(--color-ink-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  #{tag}
                  <span
                    style={{
                      background: 'var(--color-surface-alt)',
                      borderRadius: 8,
                      padding: '0 5px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-ink-tertiary)',
                    }}
                  >
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
