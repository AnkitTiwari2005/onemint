'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PublicArticle } from '@/lib/articles';
import { ArticleCard } from '@/components/ArticleCard';
import { toArticle } from '@/lib/articles';
import { easeOut } from '@/lib/motion';

interface RelatedArticlesProps {
  currentSlug: string;
  currentCategoryId: string | null;
  currentTags: string[];
  allArticles: PublicArticle[];
}

export function RelatedArticles({ currentSlug, currentCategoryId, currentTags, allArticles }: RelatedArticlesProps) {
  const prefersReduced = useReducedMotion();

  const related = useMemo(() => {
    const scored = allArticles
      .filter(a => a.slug !== currentSlug)
      .map(a => {
        let weight = 0;
        const aCatId = a.categories?.slug ?? a.category_id;
        if (aCatId && aCatId === currentCategoryId) weight += 3;
        const aTags = a.tags ?? [];
        const sharedTags = aTags.filter(t => currentTags.includes(t));
        if (sharedTags.length >= 2) weight += 2;
        else if (sharedTags.length === 1) weight += 1;
        return { article: a, weight };
      })
      .filter(s => s.weight > 0)
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return (b.article.published_at ?? '').localeCompare(a.article.published_at ?? '');
      });

    return scored.slice(0, 3).map((s, i) => toArticle(s.article, i));
  }, [currentSlug, currentCategoryId, currentTags, allArticles]);

  if (related.length === 0) return null;

  return (
    <motion.section
      initial={prefersReduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="mt-16 pt-12 border-t border-[var(--color-border)]"
    >
      <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)] mb-8">
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((article, i) => (
          <ArticleCard key={article.id} article={article} variant="standard" index={i} />
        ))}
      </div>
    </motion.section>
  );
}
