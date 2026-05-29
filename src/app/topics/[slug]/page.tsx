import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryBySlug, categories } from '@/data/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onemint.in';
import { CategoryIcon } from '@/components/CategoryIcon';
import { getAuthorById } from '@/data/authors';
import { ArticleCard } from '@/components/ArticleCard';
import { formatDate } from '@/lib/utils';
import { fetchPublishedArticles, toArticle } from '@/lib/articles';
import { Clock, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — OneMint`,
    description: category.description,
    alternates: { canonical: `${SITE_URL}/topics/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  // Fetch all published articles (DB-backed, static fallback only if DB is down)
  const { articles: allArticles } = await fetchPublishedArticles();

  // Filter to this category using the slug (works for both DB and static fallback)
  const catArticles = allArticles
    .filter((a) => a.categories?.slug === category!.slug)
    .map((a, i) => toArticle(a, i));

  const featured = catArticles[0];
  const rest = catArticles.slice(1);

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">

      {/* ── Category Header ───────────────────────────────── */}
      <header className="border-b border-[var(--color-border)]" style={{ backgroundColor: category!.lightColor }}>
        <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 font-[family-name:var(--font-ui)] transition-colors"
            style={{ color: category!.accentColor, opacity: 0.7 }}
          >
            <ArrowLeft size={15} />
            Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
              style={{ backgroundColor: `${category!.accentColor}20`, color: category!.accentColor }}
            >
              <CategoryIcon categoryId={category!.id} size={32} />
            </div>
            <div>
              <h1
                className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight"
                style={{ color: category!.accentColor }}
              >
                {category!.name}
              </h1>
              <p
                className="text-lg max-w-2xl font-[family-name:var(--font-ui)] leading-relaxed"
                style={{ color: category!.accentColor, opacity: 0.75 }}
              >
                {category!.description}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border font-[family-name:var(--font-ui)]"
              style={{ color: category!.accentColor, borderColor: `${category!.accentColor}30`, background: `${category!.accentColor}10` }}
            >
              {catArticles.length} Article{catArticles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {catArticles.length === 0 ? (
          <div className="text-center py-24">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-ink-tertiary)]"
                aria-hidden="true"
              >
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
            <p className="text-lg text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-2">
              No articles published in this category yet.
            </p>
            <p className="text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-6">
              Publish an article in this category from the admin panel to see it here.
            </p>
            <Link href="/" className="inline-block text-sm font-semibold text-[var(--color-accent)] hover:underline font-[family-name:var(--font-ui)]">
              ← Back to homepage
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <div className="mb-16">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-6 font-[family-name:var(--font-ui)]">
                  Featured in {category!.name}
                </p>
                <Link
                  href={`/articles/${featured.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-accent)] transition-all duration-300"
                >
                  <div className="relative aspect-video lg:aspect-auto min-h-[240px]">
                    <Image
                      src={featured.featuredImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      data-no-dim
                    />
                  </div>
                  <div className="p-6 lg:p-10 flex flex-col justify-center">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)] mb-4 group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-[var(--color-ink-secondary)] mb-6 line-clamp-3 font-[family-name:var(--font-body)] leading-relaxed">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                      {getAuthorById(featured.authorId) && (
                        <>
                          <span>{getAuthorById(featured.authorId)!.name}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{formatDate(featured.publishedAt)}</span>
                      <span>·</span>
                      <Clock size={10} />
                      <span>{featured.readTimeMinutes} min read</span>
                    </div>
                    <div className="mt-6">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity group-hover:opacity-90 font-[family-name:var(--font-ui)]"
                        style={{ background: category!.accentColor }}
                      >
                        Read Article →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Rest of articles grid */}
            {rest.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-6 font-[family-name:var(--font-ui)]">
                  All {category!.name} Articles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article, i) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="standard"
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
