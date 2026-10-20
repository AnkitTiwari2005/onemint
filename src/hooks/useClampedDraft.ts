'use client';

import { useState, type KeyboardEvent } from 'react';
import { computeClampNotice } from '@/lib/calculator-bounds';

export interface UseClampedDraftOptions {
  value: number;
  min: number;
  max: number;
  label: string;
  isCurrency?: boolean;
  unit?: string;
  precision?: number;
  onChange: (val: number) => void;
}

export function useClampedDraft({
  value,
  min,
  max,
  label,
  isCurrency = false,
  unit = '',
  precision = 0,
  onChange,
}: UseClampedDraftOptions) {
  const [draft, setDraft] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const displayValue = draft !== null ? draft : value;

  const handleFocus = () => {
    setDraft(String(value));
  };

  const handleChange = (rawText: string) => {
    setDraft(rawText);
    if (notice) setNotice(null);
  };

  const handleBlur = () => {
    const raw = draft ?? '';
    const { clampedValue, notice: newNotice } = computeClampNotice({
      raw,
      min,
      max,
      label,
      fallback: value,
      isCurrency,
      unit,
      precision,
    });

    setNotice(newNotice);
    onChange(clampedValue);
    setDraft(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return {
    value: displayValue,
    draft,
    notice,
    setNotice,
    clearNotice: () => setNotice(null),
    inputProps: {
      value: displayValue,
      onFocus: handleFocus,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    },
  };
}
