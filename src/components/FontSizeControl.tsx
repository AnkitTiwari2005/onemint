'use client';

import { useState, useEffect } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

type FontSize = 'small' | 'medium' | 'large';

const sizes: { key: FontSize; label: string; ariaLabel: string }[] = [
  { key: 'small', label: 'A-', ariaLabel: 'Decrease text size' },
  { key: 'medium', label: 'A', ariaLabel: 'Normal text size' },
  { key: 'large', label: 'A+', ariaLabel: 'Increase text size' },
];

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('onemint-prefs') || '{}');
      if (prefs.fontSize) {
        setFontSize(prefs.fontSize);
        document.documentElement.setAttribute('data-font-size', prefs.fontSize);
      }
    } catch { /* noop */ }
  }, []);

  const handleChange = (size: FontSize) => {
    setFontSize(size);
    document.documentElement.setAttribute('data-font-size', size);
    try {
      const prefs = JSON.parse(localStorage.getItem('onemint-prefs') || '{}');
      prefs.fontSize = size;
      localStorage.setItem('onemint-prefs', JSON.stringify(prefs));
    } catch { /* noop */ }
  };

  return (
    <RadixTooltip.Provider delayDuration={200}>
      <div className="flex items-center gap-0.5 bg-[var(--color-surface-alt)] rounded-lg p-0.5 border border-[var(--color-border)]">
        {sizes.map(({ key, label, ariaLabel }) => (
          <RadixTooltip.Root key={key}>
            <RadixTooltip.Trigger asChild>
              <button
                onClick={() => handleChange(key)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 font-[family-name:var(--font-ui)] ${
                  fontSize === key
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]'
                }`}
                aria-label={ariaLabel}
              >
                {label}
              </button>
            </RadixTooltip.Trigger>
            <RadixTooltip.Portal>
              <RadixTooltip.Content
                className="bg-[var(--color-ink)] text-white text-xs px-3 py-1.5 rounded-lg font-[family-name:var(--font-ui)]"
                sideOffset={8}
              >
                {ariaLabel}
                <RadixTooltip.Arrow className="fill-[var(--color-ink)]" />
              </RadixTooltip.Content>
            </RadixTooltip.Portal>
          </RadixTooltip.Root>
        ))}
      </div>
    </RadixTooltip.Provider>
  );
}
