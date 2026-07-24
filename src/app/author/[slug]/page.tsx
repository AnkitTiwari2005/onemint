import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { authors, getAuthorBySlug } from '@/data/authors';
import { ArticleCard } from '@/components/ArticleCard';
import { Globe } from 'lucide-react';
import { fetchPublishedArticles, toArticle } from '@/lib/articles';
import { supabaseAdmin } from '@/lib/supabase';
import { JsonLd } from '@/components/JsonLd';
import { buildPerson, buildBreadcrumbs } from '@/lib/jsonld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';

// ISR: author profiles rarely change — cache for 1 hour.
// generateStaticParams (below) pre-builds known author slugs at deploy time.
export const revalidate = 3600;

interface DbAuthor {
  id: string;
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  phone?: string;
  joined_date?: string;
  expertise_tags?: string[] | null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Try DB first, then static
  let name = '', bio = '';
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('authors').select('name, bio').eq('slug', slug).maybeSingle();
    if (data) { name = data.name; bio = data.bio ?? ''; }
  }
  if (!name) {
    const staticAuthor = getAuthorBySlug(slug);
    if (staticAuthor) { name = staticAuthor.name; bio = staticAuthor.bio; }
  }
  if (!name) return { title: 'Author Not Found' };
  return {
    title: `${name} — Author at OneMint`,
    description: bio
      ? bio.slice(0, 155)
      : `Read all articles by ${name} on OneMint — India's most trusted knowledge platform.`,
    alternates: { canonical: `${SITE_URL}/author/${slug}` },
    openGraph: {
      type: 'profile' as const,
      url: `${SITE_URL}/author/${slug}`,
      title: `${name} — OneMint Author`,
      description: bio
        ? bio.slice(0, 155)
        : `Read all articles by ${name} on OneMint.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${name} — OneMint` }],
    },
    twitter: {
      card: 'summary' as const,
      title: `${name} — OneMint Author`,
      description: bio ? bio.slice(0, 155) : `Read all articles by ${name} on OneMint.`,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;

  // 1. Look up author in DB first
  let dbAuthor: DbAuthor | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('authors')
      .select('id, name, slug, role, bio, avatar, email, twitter, linkedin, whatsapp, phone, joined_date, expertise_tags')
      .eq('slug', slug)
      .maybeSingle();
    dbAuthor = data ?? null;
  }

  // 2. Fallback to static author
  const staticAuthor = getAuthorBySlug(slug);

  // 3. Neither found → 404
  if (!dbAuthor && !staticAuthor) notFound();

  // Unified author view
  const authorName = dbAuthor?.name ?? staticAuthor!.name;
  const authorRole = dbAuthor?.role ?? staticAuthor?.role ?? '';
  const authorBio = dbAuthor?.bio ?? staticAuthor?.bio ?? '';
  const authorAvatar = dbAuthor?.avatar ?? staticAuthor?.avatar ?? '';
  const authorTwitter = dbAuthor?.twitter ?? staticAuthor?.socialLinks?.twitter ?? '';
  const authorLinkedin = dbAuthor?.linkedin ?? staticAuthor?.socialLinks?.linkedin ?? '';
  const authorWebsite = staticAuthor?.socialLinks?.website ?? '';
  const joinedYear = dbAuthor?.joined_date
    ? new Date(dbAuthor.joined_date).getFullYear()
    : staticAuthor?.joinedDate
    ? new Date(staticAuthor.joinedDate).getFullYear()
    : null;
  const expertiseTags: string[] = dbAuthor?.expertise_tags ?? [];

  // 4. Fetch articles (DB-backed)
  const { articles: allArticles } = await fetchPublishedArticles();
  const authorArticles = allArticles
    .filter((a) => a.authors?.slug === slug || a.authors?.id === (dbAuthor?.id ?? staticAuthor?.id))
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .map((a, i) => toArticle(a, i));

  const personSchema = buildPerson({
    name: authorName,
    url: `${SITE_URL}/author/${slug}`,
    bio: authorBio || undefined,
    avatar: authorAvatar || undefined,
    jobTitle: authorRole || undefined,
    twitter: authorTwitter || undefined,
    linkedin: authorLinkedin || undefined,
  });
  const breadcrumbSchema = buildBreadcrumbs([
    { name: 'Home', url: SITE_URL },
    { name: authorName, url: `${SITE_URL}/author/${slug}` },
  ]);

  return (
    <div className="pt-16 lg:pt-[72px]">
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 40, display: 'flex', gap: 8 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--color-ink)' }}>{authorName}</span>
      </nav>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap' }}>
        {authorAvatar && (
          <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid var(--color-accent)', boxShadow: '0 0 0 4px var(--color-surface)' }}>
            <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 6 }}>{authorName}</h1>
          {authorRole && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--color-accent)', fontWeight: 600, marginBottom: 12 }}>{authorRole}</p>}
          {authorBio && <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--color-ink-secondary)', lineHeight: 1.7, marginBottom: 16, maxWidth: 640 }}>{authorBio}</p>}

          {/* Expertise tags */}
          {expertiseTags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {expertiseTags.map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-secondary)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
              <strong style={{ color: 'var(--color-ink)' }}>{authorArticles.length}</strong> articles published
            </span>
            {joinedYear && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>
                Member since <strong style={{ color: 'var(--color-ink)' }}>{joinedYear}</strong>
              </span>
            )}
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {authorTwitter && (
              <a href={authorTwitter.startsWith('http') ? authorTwitter : `https://twitter.com/${authorTwitter}`} target="_blank" rel="noopener noreferrer" title="Twitter/X"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }}
                className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {authorLinkedin && (
              <a href={authorLinkedin.startsWith('http') ? authorLinkedin : `https://linkedin.com/in/${authorLinkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }}
                className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {authorWebsite && (
              <a href={authorWebsite} target="_blank" rel="noopener noreferrer"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-secondary)', textDecoration: 'none' }}
                className="hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors" aria-label="Website">
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
            Articles by {authorName}
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
    </div>
  );
}
