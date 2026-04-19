'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface CategoryPillProps {
  name: string;
  slug: string;
  accentColor: string;
  lightColor: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CategoryPill({
  name,
  slug,
  accentColor,
  lightColor,
  size = 'sm',
  className,
}: CategoryPillProps) {
  return (
    <Link href={`/topics/${slug}`}>
      <motion.span
        whileHover={{ scale: 1.05, filter: 'brightness(1.08)' }}
        transition={{ duration: 0.15 }}
        className={cn(
          'inline-block rounded-full font-semibold uppercase tracking-wider transition-colors',
          size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-1.5 text-xs',
          className
        )}
        style={{ background: lightColor, color: accentColor }}
      >
        {name}
      </motion.span>
    </Link>
  );
}
