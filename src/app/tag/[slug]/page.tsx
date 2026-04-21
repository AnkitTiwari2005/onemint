import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { ArticleCard } from '@/components/ArticleCard';
import { Hash, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getTagFromSlug(slug: string): string | undefined {
  const allTags = [...new Set(articles.flatMap((a) => a.tags))];
  return allTags.find((t) => slugifyTag(t) === slug);
}

export async function generateStaticParams() {
  const allTags = [...new Set(articles.flatMap((a) => a.tags))];
  return allTags.map((tag) => ({ slug: slugifyTag(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagFromSlug(slug);
  if (!tag) return { title: 'Tag Not Found' };
  const count = articles.filter((a) => a.tags.includes(tag)).length;
  return {
    title: `#${tag}`,
    description: `Browse ${count} OneMint article${count !== 1 ? 's' : ''} tagged with "${tag}". Covering finance, technology, health, career, and more.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = getTagFromSlug(slug);
  if (!tag) notFound();

  const tagArticles = articles.filter((a) => a.tags.includes(tag));
  if (tagArticles.length === 0) notFound();

  // Related tags: other tags that co-occur on the same articles
  const relatedTagCounts: Record<string, number> = {};
  tagArticles.forEach((article) => {
    article.tags.forEach((t) => {
      if (t !== tag) relatedTagCounts[t] = (relatedTagCounts[t] || 0) + 1;
    });
  });
  const relatedTags = Object.entries(relatedTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  return (
    <div className="pt-16 lg:pt-[72px]">
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
        <Link href="/" style={{ color: 'var(--color-ink-tertiary)', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/tags" style={{ color: 'var(--color-ink-tertiary)', textDecoration: 'none' }}>Tags</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>#{tag}</span>
      </nav>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '40px',
          marginBottom: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Hash size={28} color="white" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: 700,
              color: 'var(--color-accent)',
              margin: '0 0 8px',
            }}
          >
            #{tag}
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--color-ink-secondary)', margin: 0 }}>
            {tagArticles.length} article{tagArticles.length !== 1 ? 's' : ''} tagged with this topic
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48, alignItems: 'start' }}>
        {/* Articles Grid */}
        <div>
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
            All articles tagged #{tag}
          </h2>
          <div style={{ display: 'grid', gap: 20 }}>
            {tagArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 88 }}>
          {/* Related Tags */}
          {relatedTags.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--color-ink-tertiary)',
                  marginBottom: 12,
                }}
              >
                Related Tags
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {relatedTags.map((t) => (
                  <Link
                    key={t}
                    href={`/tag/${slugifyTag(t)}`}
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: 'var(--color-surface-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 14,
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-ink-secondary)',
                      textDecoration: 'none',
                    }}
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/tags"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: 'var(--color-ink-secondary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Browse all tags
          </Link>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: 1fr 280px"] { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </div>
    </div>
  );
}
