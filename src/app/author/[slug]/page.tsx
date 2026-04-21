import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { authors, getAuthorBySlug } from '@/data/authors';
import { articles } from '@/data/articles';
import { ArticleCard } from '@/components/ArticleCard';
import { ExternalLink, Globe } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: 'Author Not Found' };
  return {
    title: `${author.name} — OneMint`,
    description: author.bio.slice(0, 155),
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const authorArticles = articles
    .filter((a) => a.authorId === author.id)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const joinedYear = new Date(author.joinedDate).getFullYear();

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '64px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 40, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Authors</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>{author.name}</span>
      </nav>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid var(--color-accent)', boxShadow: '0 0 0 4px var(--color-surface)' }}>
          <Image src={author.avatar} alt={author.name} fill className="object-cover" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6 }}>{author.name}</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--color-accent)', fontWeight: 600, marginBottom: 12 }}>{author.role}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', lineHeight: 1.7, marginBottom: 16, maxWidth: 640 }}>{author.bio}</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
              <strong style={{ color: 'var(--color-ink)' }}>{authorArticles.length}</strong> articles published
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
              Member since <strong style={{ color: 'var(--color-ink)' }}>{joinedYear}</strong>
            </span>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 10 }}>
            {author.socialLinks.twitter && (
              <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter/X" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {author.socialLinks.linkedin && (
              <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {author.socialLinks.website && (
              <a href={author.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }} className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="Website">
                <Globe size={15} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Articles */}
      {authorArticles.length > 0 ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 24 }}>
            Articles by {author.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {authorArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-ui)' }}>
          No articles published yet.
        </div>
      )}
    </div>
  );
}
