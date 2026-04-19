'use client';

import { useId, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  format?: (v: number) => string;
  hint?: string;
}

/**
 * Premium slider input with:
 * - Gradient-filled track that reflects the current value position
 * - Synced number input on the right
 * - Floating value bubble above the thumb
 * - Mobile-friendly touch targets (44px min)
 */
export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix = '',
  suffix = '',
  format,
  hint,
}: SliderInputProps) {
  const id = useId();
  const [inputFocused, setInputFocused] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const sliderRef = useRef<HTMLInputElement>(null);

  const percent = ((value - min) / (max - min)) * 100;

  const displayValue = format ? format(value) : value.toLocaleString('en-IN');

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const handleInputFocus = () => {
    setInputFocused(true);
    setLocalInput(value.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalInput(e.target.value);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    const parsed = parseFloat(localInput.replace(/,/g, ''));
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  };

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]"
        >
          {label}
        </label>
        {hint && (
          <span className="text-xs text-[var(--color-ink-tertiary)]">{hint}</span>
        )}
      </div>

      {/* Slider + number input row */}
      <div className="flex items-center gap-3">
        {/* Slider container */}
        <div className="relative flex-1 flex items-center" style={{ minHeight: '44px' }}>
          <input
            ref={sliderRef}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="w-full h-1.5 appearance-none cursor-pointer"
            style={{
              // Gradient: accent on left (filled), surface-alt on right (empty)
              background: `linear-gradient(to right, var(--color-accent) ${percent}%, var(--color-surface-alt) ${percent}%)`,
            }}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
          />
        </div>

        {/* Synced number input */}
        <div className="relative shrink-0">
          <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden focus-within:border-[var(--color-accent)] transition-colors">
            {prefix && (
              <span className="pl-3 text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] select-none">
                {prefix}
              </span>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={inputFocused ? localInput : displayValue}
              onFocus={handleInputFocus}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-28 px-2 py-2 text-sm font-semibold text-right bg-transparent text-[var(--color-ink)] outline-none font-[family-name:var(--font-ui)]"
              aria-label={`${label} value`}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
            {suffix && (
              <span className="pr-3 text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] select-none">
                {suffix}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Min/Max hints */}
      <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] px-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
}
