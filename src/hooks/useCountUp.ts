'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  duration?: number;
  format?: (n: number) => string;
}

/**
 * Animates a number from its previous value to the new value.
 * Triggers whenever `value` changes.
 * Uses requestAnimationFrame with an easeOut curve.
 */
export function useCountUp(
  value: number,
  { duration = 700, format }: UseCountUpOptions = {}
): string {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) {
      setDisplayValue(to);
      return;
    }

    // Cancel any ongoing animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startTimeRef.current = null;

    const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentValue = from + (to - from) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  if (format) {
    return format(displayValue);
  }
  return String(Math.round(displayValue));
}
