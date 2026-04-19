'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-tertiary)] mb-4 font-[family-name:var(--font-ui)]">
        On this page
      </h4>
      <ul className="space-y-1 border-l-2 border-[var(--color-border)]">
        {items.map((item) => (
          <li key={item.id} className="relative">
            {activeId === item.id && (
              <motion.div
                layoutId="toc-indicator"
                className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-[var(--color-accent)]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <button
              onClick={() => scrollTo(item.id)}
              className={cn(
                'block text-left text-sm py-1.5 transition-colors duration-200 font-[family-name:var(--font-ui)]',
                item.level === 2 ? 'pl-4' : 'pl-8',
                activeId === item.id
                  ? 'text-[var(--color-accent)] font-semibold'
                  : 'text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]'
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
