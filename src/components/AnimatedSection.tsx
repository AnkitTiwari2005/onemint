'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUpVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Direction to fade from. Default: up */
  direction?: 'up' | 'left' | 'right' | 'none';
  /** Distance in px to travel. Default: 28 */
  distance?: number;
}

/**
 * Wraps any content with a scroll-triggered Framer Motion animation.
 * Fires once when the element first enters the viewport.
 * Respects prefers-reduced-motion via Framer Motion's built-in support.
 */
export function AnimatedSection({
  children,
  delay = 0,
  className,
  direction = 'up',
  distance = 28,
}: AnimatedSectionProps) {
  const dirMap = {
    up: { y: distance, x: 0 },
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const variants = {
    hidden: { opacity: 0, ...dirMap[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.45,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      data-motion="true"
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger wrapper — wraps children in a stagger container.
 * Each child should be a motion.div or AnimatedSection with variants.
 */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.07, delayChildren: delay },
        },
      }}
      data-motion="true"
    >
      {children}
    </motion.div>
  );
}
