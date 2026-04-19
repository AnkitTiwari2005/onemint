'use client';

import { useEffect, useRef, useState } from 'react';

type ScrollDirection = 'up' | 'down' | 'idle';

/**
 * Returns the current scroll direction.
 * Throttled to one frame (16ms) for performance.
 * Used by Header to hide on mobile scroll-down, show on scroll-up.
 */
export function useScrollDirection(threshold = 8): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('idle');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const diff = currentScrollY - lastScrollY.current;

          if (Math.abs(diff) > threshold) {
            setDirection(diff > 0 ? 'down' : 'up');
            lastScrollY.current = currentScrollY;
          }

          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return direction;
}
