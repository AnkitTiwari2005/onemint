'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { articles, type Article } from '@/data/articles';
import { ArticleCard } from '@/components/ArticleCard';
import { easeOut } from '@/lib/motion';

interface RelatedArticlesProps {
  currentArticle: Article;
}

export function RelatedArticles({ currentArticle }: RelatedArticlesProps) {
  const prefersReduced = useReducedMotion();

  const related = useMemo(() => {
    const scored = articles
      .filter(a => a.id !== currentArticle.id)
      .map(a => {
        let weight = 0;
        if (a.categoryId === currentArticle.categoryId) weight += 3;
        const sharedTags = a.tags.filter(t => currentArticle.tags.includes(t));
        if (sharedTags.length >= 2) weight += 2;
        else if (sharedTags.length === 1) weight += 1;
        return { article: a, weight };
      })
      .filter(s => s.weight > 0)
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime();
      });

    return scored.slice(0, 3).map(s => s.article);
  }, [currentArticle]);

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
