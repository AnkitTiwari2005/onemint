'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { getCategoryById } from '@/data/categories';
import { getAuthorById } from '@/data/authors';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { easeOut } from '@/lib/motion';
import type { Article } from '@/data/articles';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'standard' | 'compact';
  index?: number;
  priority?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: easeOut },
  }),
};

export function ArticleCard({ article, variant = 'standard', index = 0, priority = false }: ArticleCardProps) {
  const prefersReduced = useReducedMotion();
  const category = getCategoryById(article.categoryId);
  const author = getAuthorById(article.authorId);

  if (variant === 'hero') return <HeroCard article={article} category={category} author={author} priority={priority} />;
  if (variant === 'compact') return <CompactCard article={article} category={category} index={index} />;

  // Standard Card
  return (
    <motion.div
      custom={index}
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={cardVariants}
    >
      <Link
        href={`/articles/${article.slug}`}
        className="group block bg-[var(--color-surface)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
      >
        <motion.div
          className="relative aspect-video overflow-hidden"
          whileHover={{ scale: 1 }}
        >
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        </motion.div>

        <div className="p-3 sm:p-5">
          {category && (
            <span
              className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-2 sm:mb-3"
              style={{ background: category.lightColor, color: category.accentColor }}
            >
              {category.name}
            </span>
          )}
          <h3 className="font-[family-name:var(--font-heading)] text-sm sm:text-lg font-semibold text-[var(--color-ink)] line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[var(--color-accent)] transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="hidden sm:block text-sm text-[var(--color-ink-secondary)] line-clamp-1 mb-3 font-[family-name:var(--font-body)]">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[var(--color-ink-tertiary)]">
              {author && (
                <>
                  <Image src={author.avatar} alt={author.name} width={16} height={16} className="rounded-full hidden sm:block" />
                  <span className="font-medium hidden sm:inline">{author.name}</span>
                  <span className="hidden sm:inline">·</span>
                </>
              )}
              <span className="text-[10px] sm:text-xs">{formatDate(article.publishedAt)}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-[var(--color-ink-tertiary)] bg-[var(--color-surface-alt)] px-1.5 sm:px-2 py-0.5 rounded font-[family-name:var(--font-mono)]">
              {article.readTimeMinutes}m
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* Hero Card — full-bleed image overlay */
function HeroCard({
  article,
  category,
  author,
  priority,
}: {
  article: Article;
  category: ReturnType<typeof getCategoryById>;
  author: ReturnType<typeof getAuthorById>;
  priority: boolean;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative block rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[480px]"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority={priority}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
        {category && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white mb-3"
            style={{ background: category.accentColor }}
          >
            {category.name}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl lg:text-[40px] font-bold text-white leading-tight mb-3"
        >
          {article.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-white/80 text-sm lg:text-base mb-3 line-clamp-2 font-[family-name:var(--font-body)]"
        >
          {article.deck}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center gap-3 text-white/70 text-sm"
        >
          {author && (
            <>
              <Image
                src={author.avatar}
                alt={author.name}
                width={28}
                height={28}
                className="rounded-full border-2 border-white/30"
              />
              <span className="font-medium">{author.name}</span>
              <span>·</span>
            </>
          )}
          <span>{formatDate(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readTimeMinutes} min read</span>
        </motion.div>
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--color-accent-gold)] text-white text-[10px] font-bold uppercase tracking-wider">
        Featured
      </div>
    </Link>
  );
}

/* Compact Card — text-only with rank number */
function CompactCard({
  article,
  category,
  index,
}: {
  article: Article;
  category: ReturnType<typeof getCategoryById>;
  index: number;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block py-5 first:pt-0 last:pb-0"
    >
      {category && (
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: category.accentColor }}
        >
          {category.name}
        </span>
      )}
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-ink)] mt-1 mb-1.5 group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug">
        {article.title}
      </h2>
      <p className="text-sm text-[var(--color-ink-secondary)] line-clamp-1 mb-2 font-[family-name:var(--font-body)]">
        {article.excerpt}
      </p>
      <span className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-mono)]">
        {article.readTimeMinutes} min read
      </span>
    </Link>
  );
}
