import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { articles, getArticleBySlug, getArticlesByCategory } from '@/data/articles';
import { getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';
import { formatDate } from '@/lib/utils';
import { ShareBar } from '@/components/ShareBar';
import { ArticleFeedback } from '@/components/ArticleFeedback';
import { RelatedArticles } from '@/components/RelatedArticles';
import { TableOfContents } from '@/components/TableOfContents';
import { FontSizeControl } from '@/components/FontSizeControl';
import { GlossaryTooltip } from '@/components/GlossaryTooltip';
import { Lightbulb, MessageSquare, ExternalLink, Clock, BookOpen } from 'lucide-react';

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.featuredImage, width: 800, height: 450 }],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = getCategoryById(article.categoryId);
  const author = getAuthorById(article.authorId);

  // Related in same category
  const related = getArticlesByCategory(article.categoryId)
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  const tocItems = [
    { id: 'section-1', text: 'Why Your 30s Matter', level: 2 },
    { id: 'section-2', text: 'Emergency Fund First', level: 2 },
    { id: 'section-3', text: 'Understanding SIP Investing', level: 2 },
    { id: 'section-4', text: 'Tax-Saving Strategies', level: 2 },
  ];

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
              style={{ background: category.lightColor, color: category.accentColor }}
            >
              {category.name}
            </Link>
          )}

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--color-ink)] leading-[1.15] mb-6">
            {article.title}
          </h1>

          {article.deck && (
            <p className="font-[family-name:var(--font-heading)] text-lg lg:text-xl text-[var(--color-ink-secondary)] mb-8 leading-relaxed">
              {article.deck}
            </p>
          )}

          {/* Author Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {author && (
                <Link href={`/author/${author.slug}`}>
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={48}
                    height={48}
                    className="rounded-full border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                  />
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
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="opacity-50">•</span>
                  <BookOpen size={10} />
                  <span className="font-semibold text-[var(--color-ink-secondary)]">{article.readTimeMinutes} min read</span>
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
        {article.featuredImage && (
          <figure className="mb-12 relative group">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-surface-alt)]">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                priority
                data-no-dim
              />
            </div>
          </figure>
        )}

        {/* Article Layout with Sidebar */}
        <div className="relative flex flex-col lg:flex-row gap-16">

          {/* TOC Sidebar */}
          <aside className="hidden lg:block w-[220px] shrink-0 toc-sidebar">
            <div className="sticky top-28">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          {/* Article Body */}
          <div className="article-body flex-1 min-w-0">
            <p>Your 30s are arguably the most important decade for your financial life. You&apos;re likely earning more than you did in your 20s, but you also have more responsibilities. How you manage your money now will determine your lifestyle in your 50s and beyond.</p>

            <h2 id="section-1">Why Your 30s Matter</h2>
            <p>The power of <GlossaryTooltip term="CAGR">compounding</GlossaryTooltip> is strongest when given time. A rupee invested at age 30 has a significantly higher chance of multiplying than one invested at 40. This is the decade where the gap between the financially aware and the financially ignorant widens permanently.</p>

            <div className="my-10 bg-[var(--color-surface-alt)] border border-[var(--color-border)] p-6 rounded-2xl">
              <strong className="flex items-center gap-2 text-[var(--color-accent)] font-[family-name:var(--font-heading)] text-lg mb-2">
                <Lightbulb size={20} /> Key Insight
              </strong>
              <p className="m-0 text-[var(--color-ink)] font-medium">If you start investing ₹15,000 per month at age 30 and achieve a 12% annual return, you&apos;ll have over ₹1 Crore by age 45.</p>
            </div>

            <h2 id="section-2">Emergency Fund First</h2>
            <p>Before any equity investment, ensure you have an emergency fund. In India, this should ideally cover 6–9 months of mandatory expenses including EMIs, school fees, and basic living costs.</p>

            <blockquote>
              &quot;An emergency fund is not an investment. It is an insurance policy against having to sell your actual investments at the worst possible time.&quot;
            </blockquote>

            <h2 id="section-3">Understanding SIP Investing</h2>
            <p><GlossaryTooltip term="SIP">Systematic Investment Plans</GlossaryTooltip> in mutual funds remain the most efficient wealth creation tool for salaried professionals. They automate your investing and help average out market volatility through rupee cost averaging. This helps beat <GlossaryTooltip term="Inflation">inflation</GlossaryTooltip> over the long term.</p>

            <div className="my-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
              <div className="bg-[var(--color-surface-alt)] px-6 py-4 border-b border-[var(--color-border)] font-[family-name:var(--font-heading)] font-semibold flex items-center justify-between">
                <span>Interactive Tool: SIP Growth</span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-ink-tertiary)] bg-[var(--color-border)]/50 px-2 py-0.5 rounded-full font-[family-name:var(--font-ui)]">Mini Calc</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-ink-tertiary)] mb-2 font-[family-name:var(--font-ui)]">Monthly Investment</label>
                    <div className="font-[family-name:var(--font-mono)] text-xl font-medium text-[var(--color-ink)]">₹ 15,000</div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--color-ink-tertiary)] mb-2 font-[family-name:var(--font-ui)]">Expected Return</label>
                    <div className="font-[family-name:var(--font-mono)] text-xl font-medium text-[var(--color-ink)]">12%</div>
                  </div>
                </div>
                <div className="bg-[var(--color-cat-finance-light)] p-5 rounded-xl border border-[var(--color-cat-finance)]/20">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[var(--color-cat-finance)] mb-1 font-[family-name:var(--font-ui)]">Wealth after 20 years</label>
                  <div className="font-[family-name:var(--font-mono)] text-3xl font-bold text-[var(--color-cat-finance)]">₹ 1.50 Crore</div>
                </div>
                <Link href="/tools/sip" className="inline-flex items-center justify-center w-full gap-2 text-sm text-white font-semibold mt-6 bg-[var(--color-accent)] py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Open Full SIP Calculator →
                </Link>
              </div>
            </div>

            <h2 id="section-4">Tax-Saving Strategies</h2>
            <p>Many 30-somethings fall into the 30% tax bracket. Utilizing Section 80C through ELSS funds, term insurance, and PPF is standard. However, you should also look at NPS (Section 80CCD) for an additional ₹50,000 deduction.</p>

            <p className="pull-quote">Don&apos;t let tax-saving dictate your investment choices. Poor investments made just to save tax cost more in the long run.</p>
          </div>
        </div>

        {/* Post Article Footer */}
        <footer className="mt-16">

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {article.tags.map(tag => (
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
          {author && (
            <div className="bg-[var(--color-surface-alt)] p-8 rounded-3xl mb-4 border border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Image src={author.avatar} alt={author.name} width={96} height={96} className="rounded-full shrink-0 border-4 border-[var(--color-surface)] shadow-sm" />
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--color-ink)] mb-1">{author.name}</h3>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3 font-[family-name:var(--font-ui)]">{author.role}</p>
                  <p className="text-[var(--color-ink-secondary)] mb-4 leading-relaxed font-[family-name:var(--font-body)] max-w-2xl">{author.bio}</p>
                  <Link href={`/author/${author.slug}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] flex items-center gap-1 group">
                    Read {author.articleCount} articles
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Giscus Comments Placeholder ──────────────────── */}
          <div className="comments-section mt-12 mb-16 border border-[var(--color-border)] rounded-3xl overflow-hidden">
            <div className="bg-[var(--color-surface-alt)] px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--color-ink-secondary)]" />
              <h2 className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Discussion</h2>
              <span className="ml-auto text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Powered by Giscus</span>
            </div>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={20} className="text-[var(--color-ink-tertiary)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-1 font-[family-name:var(--font-ui)]">Comments powered by Giscus</p>
              <p className="text-xs text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">
                Sign in with GitHub to join the discussion. Comments are backed by GitHub Discussions.
              </p>
              <a
                href="https://giscus.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline font-[family-name:var(--font-ui)]"
              >
                Configure Giscus for this repo <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Related Articles */}
          <RelatedArticles currentArticle={article} />

        </footer>
      </article>
    </div>
  );
}
