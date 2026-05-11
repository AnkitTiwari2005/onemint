import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { articles as staticArticles, getArticleBySlug } from '@/data/articles';
import { getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { ShareBar } from '@/components/ShareBar';
import { ArticleFeedback } from '@/components/ArticleFeedback';
import { RelatedArticles } from '@/components/RelatedArticles';
import { TableOfContents } from '@/components/TableOfContents';
import { FontSizeControl } from '@/components/FontSizeControl';
import { GlossaryTooltip } from '@/components/GlossaryTooltip';
import { GiscusComments } from '@/components/GiscusComments';
import { Clock, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Keep static slugs always routable, plus any DB slugs discovered at runtime
export async function generateStaticParams() {
  const staticSlugs = staticArticles.map((a) => ({ slug: a.slug }));
  if (!supabaseAdmin) return staticSlugs;
  try {
    const { data } = await supabaseAdmin
      .from('articles')
      .select('slug')
      .eq('status', 'published');
    const dbSlugs = (data ?? []).map((r: { slug: string }) => ({ slug: r.slug }));
    const all = new Map<string, { slug: string }>();
    [...staticSlugs, ...dbSlugs].forEach((s) => all.set(s.slug, s));
    return Array.from(all.values());
  } catch {
    return staticSlugs;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────
interface DbArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category_id: string | null;
  tags: string[] | null;
  read_time_minutes: number | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  categories: { id: string; name: string; slug: string; accent_color?: string; light_color?: string } | null;
  authors: { id: string; name: string; slug: string; bio?: string; avatar?: string; role?: string } | null;
}

async function fetchArticle(slug: string): Promise<{
  source: 'db' | 'static';
  article: DbArticle | null;
}> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        id, title, slug, excerpt, content, cover_image,
        category_id, tags, read_time_minutes, published_at,
        meta_title, meta_description,
        categories(id, name, slug, accent_color, light_color),
        authors(id, name, slug, bio, avatar, role)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (!error && data) return { source: 'db', article: data as unknown as DbArticle };
  }

  // Fall back to static data
  const staticArticle = getArticleBySlug(slug);
  if (!staticArticle) return { source: 'static', article: null };

  const cat = getCategoryById(staticArticle.categoryId);
  const auth = getAuthorById(staticArticle.authorId);
  return {
    source: 'static',
    article: {
      id: staticArticle.id,
      title: staticArticle.title,
      slug: staticArticle.slug,
      excerpt: staticArticle.excerpt,
      content: null, // static articles have no DB body
      cover_image: staticArticle.featuredImage,
      category_id: staticArticle.categoryId,
      tags: staticArticle.tags,
      read_time_minutes: staticArticle.readTimeMinutes,
      published_at: staticArticle.publishedAt,
      meta_title: staticArticle.title,
      meta_description: staticArticle.excerpt,
      categories: cat ? { id: cat.id, name: cat.name, slug: cat.slug, accent_color: cat.accentColor, light_color: cat.lightColor } : null,
      authors: auth ? { id: auth.id, name: auth.name, slug: auth.slug, bio: auth.bio, avatar: auth.avatar, role: auth.role } : null,
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article } = await fetchArticle(slug);
  if (!article) return {};
  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      images: article.cover_image ? [{ url: article.cover_image, width: 800, height: 450 }] : [],
    },
  };
}

// Static fallback body for articles that have no DB content yet
function StaticFallbackBody() {
  return (
    <div className="article-body flex-1 min-w-0">
      <p>Your 30s are arguably the most important decade for your financial life. You&apos;re likely earning more than you did in your 20s, but you also have more responsibilities. How you manage your money now will determine your lifestyle in your 50s and beyond.</p>
      <h2 id="section-1">Why Your 30s Matter</h2>
      <p>The power of <GlossaryTooltip term="CAGR">compounding</GlossaryTooltip> is strongest when given time. A rupee invested at age 30 has a significantly higher chance of multiplying than one invested at 40.</p>
      <h2 id="section-2">Emergency Fund First</h2>
      <p>Before any equity investment, ensure you have an emergency fund. In India, this should ideally cover 6–9 months of mandatory expenses including EMIs, school fees, and basic living costs.</p>
      <h2 id="section-3">Understanding SIP Investing</h2>
      <p><GlossaryTooltip term="SIP">Systematic Investment Plans</GlossaryTooltip> in mutual funds remain the most efficient wealth creation tool for salaried professionals.</p>
      <h2 id="section-4">Tax-Saving Strategies</h2>
      <p>Many 30-somethings fall into the 30% tax bracket. Utilizing Section 80C through ELSS funds, term insurance, and PPF is standard.</p>
    </div>
  );
}

const DEFAULT_TOC = [
  { id: 'section-1', text: 'Why Your 30s Matter', level: 2 },
  { id: 'section-2', text: 'Emergency Fund First', level: 2 },
  { id: 'section-3', text: 'Understanding SIP Investing', level: 2 },
  { id: 'section-4', text: 'Tax-Saving Strategies', level: 2 },
];

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { article, source } = await fetchArticle(slug);

  if (!article) notFound();

  const category = article.categories;
  const author = article.authors;

  // Related articles (from static seed for now)
  const staticArticle = getArticleBySlug(slug);
  const related = staticArticle
    ? staticArticles.filter((a) => a.categoryId === staticArticle.categoryId && a.slug !== slug).slice(0, 3)
    : [];

  const hasDbContent = source === 'db' && !!article.content?.trim();
  const tocItems = DEFAULT_TOC; // TODO: parse headings from markdown content

  return (
    <div className="pt-16 lg:pt-[72px] pb-20">
      <article className="max-w-[var(--article-max)] mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-tertiary)] mb-8 font-[family-name:var(--font-ui)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          {category && (
            <>
              <Link href={`/topics/${category.slug}`} className="hover:text-[var(--color-ink)] transition-colors">{category.name}</Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span className="text-[var(--color-ink-secondary)] truncate max-w-[200px]">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          {category && (
            <Link
              href={`/topics/${category.slug}`}
              className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 transition-opacity hover:opacity-80 font-[family-name:var(--font-ui)]"
              style={{ background: category.light_color ?? 'var(--color-surface-alt)', color: category.accent_color ?? 'var(--color-accent)' }}
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--color-ink)] leading-[1.15] mb-6">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="font-[family-name:var(--font-heading)] text-lg lg:text-xl text-[var(--color-ink-secondary)] mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Author Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {author?.avatar && (
                <Link href={`/author/${author.slug}`}>
                  <Image src={author.avatar} alt={author.name} width={48} height={48} className="rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors" />
                </Link>
              )}
              <div>
                <div className="flex items-center gap-1.5 font-[family-name:var(--font-ui)]">
                  <span className="text-sm text-[var(--color-ink-secondary)]">By</span>
                  {author ? (
                    <Link href={`/author/${author.slug}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
                      {author.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--color-ink)]">OneMint Editorial</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)] uppercase tracking-wider">
                  <Clock size={10} />
                  <span>{article.published_at ? formatDate(article.published_at) : ''}</span>
                  <span className="opacity-50">•</span>
                  <BookOpen size={10} />
                  <span className="font-semibold text-[var(--color-ink-secondary)]">{article.read_time_minutes ?? 5} min read</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FontSizeControl />
              <div className="w-px h-6 bg-[var(--color-border)]" aria-hidden="true" />
              <ShareBar title={article.title} slug={article.slug} />
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {article.cover_image && (
          <figure className="mb-12 relative group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-surface-alt)]">
              <Image src={article.cover_image} alt={article.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" priority data-no-dim />
            </div>
          </figure>
        )}

        {/* Article Layout */}
        <div className="relative flex flex-col lg:flex-row gap-16">
          {/* TOC Sidebar */}
          <aside className="hidden lg:block w-[220px] shrink-0 toc-sidebar">
            <div className="sticky top-28">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          {/* Article Body */}
          {hasDbContent ? (
            <div className="article-body flex-1 min-w-0 prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content!}
              </ReactMarkdown>
            </div>
          ) : (
            <StaticFallbackBody />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {(article.tags ?? []).map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-accent)] hover:text-white transition-colors font-[family-name:var(--font-ui)]"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Feedback */}
          <div className="max-w-xl mx-auto mb-16">
            <ArticleFeedback />
          </div>

          {/* Author Bio */}
          {author?.bio && (
            <div className="bg-[var(--color-surface-alt)] p-8 rounded-3xl mb-4 border border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {author.avatar && (
                  <Image src={author.avatar} alt={author.name} width={96} height={96} className="rounded-full shrink-0 border-4 border-[var(--color-surface)] shadow-sm" />
                )}
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-ink)] mb-1">{author.name}</h3>
                  {author.role && (
                    <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 font-[family-name:var(--font-ui)]">{author.role}</p>
                  )}
                  <p className="text-[var(--color-ink-secondary)] mb-4 leading-relaxed font-[family-name:var(--font-body)] max-w-2xl">{author.bio}</p>
                  <Link href={`/author/${author.slug}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] flex items-center gap-1 group">
                    View all articles <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="comments-section mt-12 mb-16 border border-[var(--color-border)] rounded-3xl overflow-hidden">
            <div className="bg-[var(--color-surface-alt)] px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Discussion</h2>
              <span className="ml-auto text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Powered by Giscus</span>
            </div>
            <div className="p-4"><GiscusComments /></div>
          </div>

          {/* Related Articles */}
          {staticArticle && <RelatedArticles currentArticle={staticArticle} />}
        </footer>
      </article>
    </div>
  );
}
