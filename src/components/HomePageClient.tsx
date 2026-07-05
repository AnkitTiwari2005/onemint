'use client';

/**
 * HomePageClient — Client component containing all interactive homepage UI.
 *
 * Articles are fetched server-side in page.tsx and passed as props, so:
 * - Google crawls real article content (SEO win)
 * - All framer-motion animations are preserved
 * - No hydration mismatch (server & client see same data)
 * - No useEffect article fetch (instant render, no skeleton flash)
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, TrendingUp, Star, CheckCircle2, Loader2, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { categories as staticCategories } from '@/data/categories';
import { getCategoryById } from '@/data/categories';

import { ArticleCard } from '@/components/ArticleCard';
import { MarketTicker } from '@/components/MarketTicker';
import { AnimatedSection, StaggerContainer } from '@/components/AnimatedSection';
import { formatDate } from '@/lib/utils';
import { cardVariants, heroVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { trackEvent } from '@/lib/analytics';
import type { Article } from '@/data/articles';

type NewsletterState = 'idle' | 'loading' | 'success' | 'error';

interface HomePageClientProps {
  /** Pre-fetched articles from the server — passed as props to avoid client-side fetch */
  articles: Article[];
  /** Real trending article slugs from analytics (engagement score), refreshed every 24h */
  trendingSlugs?: string[];
  /** Real most-read article slugs from GA4/Supabase, refreshed every Monday 1 AM IST */
  mostReadSlugs?: string[];
}

export function HomePageClient({ articles, trendingSlugs = [], mostReadSlugs = [] }: HomePageClientProps) {
  const prefersReduced = useReducedMotion();

  // ── Derived lists (same logic as before, now from props not state) ───────
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const featuredCategory =
    getCategoryById(featured?.categoryId ?? '') ??
    (featured
      ? {
          id: featured.categoryId,
          name: '',
          slug: '',
          accentColor: 'var(--color-accent)',
          lightColor: 'var(--color-surface-alt)',
          description: '',
          icon: '',
        }
      : null);
  // Use embedded author data from DB join — no static lookup needed
  const featuredAuthor = featured?.authorName
    ? { name: featured.authorName, avatar: featured.authorAvatar ?? '' }
    : null;
  const secondary = articles.filter((a) => !a.featured && a.id !== featured?.id).slice(0, 3);
  // Real analytics-driven trending & most-read — falls back to recent articles when empty
  const trending = trendingSlugs.length > 0
    ? trendingSlugs
        .map((slug) => articles.find((a) => a.slug === slug))
        .filter((a): a is Article => a !== undefined)
    : articles.slice(0, 8);
  const mostRead = mostReadSlugs.length > 0
    ? mostReadSlugs
        .map((slug) => articles.find((a) => a.slug === slug))
        .filter((a): a is Article => a !== undefined)
    : articles.slice(0, 5);

  // ── Newsletter form state ─────────────────────────────────────────────────
  const [nlEmail, setNlEmail] = useState('');
  const [nlState, setNlState] = useState<NewsletterState>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlState('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      });
      if (!res.ok) throw new Error('Subscription failed');
      setNlState('success');
      trackEvent('Newsletter Subscribe', { location: 'homepage' });
      setTimeout(() => { setNlState('idle'); setNlEmail(''); }, 6000);
    } catch {
      setNlState('error');
      setTimeout(() => setNlState('idle'), 4000);
    }
  };

  // No articles at all (extremely rare — DB empty + static fallback empty)
  if (!featured) return null;

  return (
    <div className="pt-16 lg:pt-[72px] pb-28 md:pb-0">

      {/* Visually-hidden H1 for SEO — gives the homepage a proper single <h1>
          without affecting visual design. Screen readers will announce it. */}
      <h1
        style={{
          position: 'absolute',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        OneMint — India&apos;s Most Trusted Knowledge Platform
      </h1>

      {/* ── Market Ticker ──────────────────────────────────────────────── */}
      <MarketTicker />

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Main featured article */}
          <motion.div
            className="lg:col-span-7"
            variants={prefersReduced ? undefined : { initial: heroVariants.image.initial, animate: heroVariants.image.animate }}
            initial="initial"
            animate="animate"
            data-motion="true"
          >
            <Link href={`/articles/${featured.slug}`} className="group relative block rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[480px] bg-[var(--color-surface-alt)]">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                unoptimized
                data-no-dim
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
                {featuredCategory?.name && (
                  <motion.span
                    variants={prefersReduced ? undefined : heroVariants.pill}
                    initial="initial"
                    animate="animate"
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white mb-3"
                    style={{ background: featuredCategory.accentColor }}
                    data-motion="true"
                  >
                    {featuredCategory.name}
                  </motion.span>
                )}
                <motion.h2
                  variants={prefersReduced ? undefined : heroVariants.title}
                  initial="initial"
                  animate="animate"
                  className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl lg:text-[40px] font-bold text-white leading-tight mb-3"
                  data-motion="true"
                >
                  {featured.title}
                </motion.h2>
                <motion.div
                  variants={prefersReduced ? undefined : heroVariants.meta}
                  initial="initial"
                  animate="animate"
                  className="flex flex-wrap items-center gap-3 text-white/75 text-sm font-[family-name:var(--font-ui)]"
                  data-motion="true"
                >
                  {featuredAuthor && (
                    <>
                      <Image src={featuredAuthor.avatar} alt={featuredAuthor.name} width={24} height={24} className="rounded-full border border-white/30" />
                      <span className="font-medium">{featuredAuthor.name}</span>
                      <span>·</span>
                    </>
                  )}
                  {featured.publishedAt && <span>{formatDate(featured.publishedAt)}</span>}
                  <span>·</span>
                  <span>{featured.readTimeMinutes} min read</span>
                </motion.div>
              </div>

              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-gold)] text-white text-[10px] font-bold uppercase tracking-wider">
                  <Star size={10} fill="white" />
                  Featured
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Secondary stack */}
          <motion.div
            className="lg:col-span-5"
            variants={prefersReduced ? undefined : heroVariants.secondary}
            initial="initial"
            animate="animate"
            data-motion="true"
          >
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:hidden gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {secondary.map((article) => {
                const cat = getCategoryById(article.categoryId);
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group shrink-0 w-[200px] bg-[var(--color-surface)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all shadow-[var(--shadow-card)]">
                    <div className="relative h-28 w-full overflow-hidden">
                      <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-[1.05] transition-transform duration-500" sizes="200px" unoptimized />
                    </div>
                    <div className="p-3">
                      {cat && <span className="text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-ui)]" style={{ color: cat.accentColor }}>{cat.name}</span>}
                      <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug mt-0.5 group-hover:text-[var(--color-accent)] transition-colors">
                        {article.title}
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)] flex items-center gap-1">
                        <Clock size={9} />{article.readTimeMinutes} min
                      </p>
                    </div>
                  </Link>
                );
              })}
              <Link href="/articles" className="shrink-0 w-[140px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] p-4 text-center">
                <ArrowRight size={18} />
                <span className="text-xs">View all</span>
              </Link>
            </div>

            {/* Desktop: vertical stack */}
            <div className="hidden lg:flex flex-col gap-5">
              {secondary.map((article) => {
                const cat = getCategoryById(article.categoryId);
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors">
                    <div className="relative w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-alt)]">
                      <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-[1.05] transition-transform duration-500" sizes="96px" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      {cat && <span className="text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-ui)]" style={{ color: cat.accentColor }}>{cat.name}</span>}
                      <h2 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug mt-0.5 mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                        {article.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
                        {article.authorName && <span>{article.authorName}</span>}
                        <span>·</span>
                        <Clock size={10} />
                        <span>{article.readTimeMinutes} min</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <Link href="/articles" className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]">
                View all articles <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trending Bar ───────────────────────────────────────────────── */}
      <AnimatedSection className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-[var(--color-accent-warm)]">
              <Flame size={16} />
              <span className="text-xs font-bold uppercase tracking-widest font-[family-name:var(--font-ui)]">Trending Now</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-stretch divide-x divide-[var(--color-border)]">
              {trending.slice(0, 5).map((article, i) => {
                const cat = getCategoryById(article.categoryId);
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group flex-1 min-w-[180px] sm:min-w-[220px] p-4 hover:bg-[var(--color-surface-alt)] transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-border-strong)] shrink-0 leading-none mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        {cat && <span className="text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-ui)]" style={{ color: cat.accentColor }}>{cat.name}</span>}
                        <p className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2 leading-snug mt-0.5 group-hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-heading)]">
                          {article.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Category Rows ──────────────────────────────────────────────── */}
      {staticCategories.slice(0, 6).map((category) => {
        const catArticles = articles.filter((a) => a.categoryId === category.slug || a.categoryId === category.id).slice(0, 4);
        if (catArticles.length === 0) return null;
        return (
          <AnimatedSection key={category.id} delay={0} className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: category.accentColor }} />
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">{category.name}</h2>
                <span className="hidden sm:inline text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">{category.description}</span>
              </div>
              <Link href={`/topics/${category.slug}`} className="text-sm font-semibold flex items-center gap-1 font-[family-name:var(--font-ui)] hover:gap-2 transition-all" style={{ color: category.accentColor }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {catArticles.map((article, i) => (
                <motion.div key={article.id} variants={cardVariants} data-motion="true">
                  <ArticleCard article={article} variant="standard" index={i} />
                </motion.div>
              ))}
            </StaggerContainer>
          </AnimatedSection>
        );
      })}

      {/* ── Most Read + Newsletter ──────────────────────────────────────── */}
      <AnimatedSection className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Newsletter CTA */}
          <div className="lg:col-span-4 lg:order-last">
            <div className="bg-[var(--color-cat-finance-light)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-[var(--color-cat-finance)]" />
                <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">Stay Informed</h2>
              </div>
              <p className="text-sm text-[var(--color-ink-secondary)] mb-5 font-[family-name:var(--font-ui)] leading-relaxed">
                Get our best articles on personal finance, health, and careers — weekly, curated, zero spam.
              </p>
              {nlState === 'success' ? (
                <div className="flex items-center gap-2 py-4 text-[var(--color-cat-finance)] font-semibold font-[family-name:var(--font-ui)]">
                  <CheckCircle2 size={18} /> You&apos;re subscribed!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-tertiary)] outline-none focus:border-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)]"
                  />
                  <button
                    type="submit"
                    disabled={nlState === 'loading'}
                    className={cn(
                      'w-full py-3 rounded-xl text-sm font-semibold text-white font-[family-name:var(--font-ui)] transition-all',
                      nlState === 'loading' ? 'bg-[var(--color-ink-tertiary)] cursor-not-allowed' : 'bg-[var(--color-accent)] hover:opacity-90 active:scale-[0.98]'
                    )}
                  >
                    {nlState === 'loading' ? <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Subscribing...</span> : 'Subscribe Free'}
                  </button>
                  <p className="text-[10px] text-[var(--color-ink-tertiary)] text-center font-[family-name:var(--font-ui)]">Zero spam · Unsubscribe anytime</p>
                </form>
              )}
            </div>
          </div>

          {/* Most Read list */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp size={18} className="text-[var(--color-accent-warm)]" />
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">Most Read This Week</h2>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl divide-y divide-[var(--color-border)]">
              {mostRead.map((article, i) => {
                const cat = getCategoryById(article.categoryId);
                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group flex items-center gap-3 sm:gap-4 px-4 py-4 sm:p-5 hover:bg-[var(--color-surface-alt)] transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                    <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-border-strong)] w-7 sm:w-8 shrink-0 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      {cat && <span className="text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-ui)]" style={{ color: cat.accentColor }}>{cat.name}</span>}
                      <h3 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold text-[var(--color-ink)] line-clamp-2 sm:line-clamp-1 mt-0.5 group-hover:text-[var(--color-accent)] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)]">{article.readTimeMinutes} min read</p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--color-ink-tertiary)] group-hover:text-[var(--color-accent)] shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Remaining category rows ─────────────────────────────────────── */}
      {staticCategories.slice(6).map((category) => {
        const catArticles = articles.filter((a) => a.categoryId === category.slug || a.categoryId === category.id).slice(0, 3);
        if (catArticles.length === 0) return null;
        return (
          <AnimatedSection key={category.id} className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: category.accentColor }} />
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">{category.name}</h2>
              </div>
              <Link href={`/topics/${category.slug}`} className="text-sm font-semibold flex items-center gap-1 font-[family-name:var(--font-ui)] hover:gap-2 transition-all" style={{ color: category.accentColor }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {catArticles.map((article, i) => (
                <motion.div key={article.id} variants={cardVariants} data-motion="true">
                  <ArticleCard article={article} variant="standard" index={i} />
                </motion.div>
              ))}
            </StaggerContainer>
          </AnimatedSection>
        );
      })}

    </div>
  );
}
