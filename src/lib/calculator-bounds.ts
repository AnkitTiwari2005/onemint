/**
 * Shared bounds, clamp validators, and boundary notification helpers for financial calculators.
 * Ensures number inputs, sliders, and automated test assertions share
 * the exact same range, step, and boundary notice logic.
 */

import { formatIndianNumber } from '@/lib/utils';

export const HOME_LOAN_BOUNDS = {
  amount: { min: 100000, max: 50000000, step: 100000, default: 5000000 },
  rate:   { min: 5, max: 20, step: 0.1, default: 8.5 },
  tenure: { min: 1, max: 30, step: 1, default: 20 },
} as const;

export const SIP_BOUNDS = {
  monthly: {
    min: 500,
    max: 1000000,        // Max allowed for typed amount (₹10 Lakhs/mo)
    sliderMax: 100000,   // Max for the range slider (₹1 Lakh/mo) for responsive mobile dragging
    step: 500,
    default: 25000,
  },
  rate:    { min: 1, max: 30, step: 0.5, default: 12 },            // 1% to 30% p.a.
  years:   { min: 1, max: 40, step: 1, default: 10 },              // 1 to 40 years
} as const;

export const INCOME_TAX_BOUNDS = {
  income: { min: 100000, max: 500000000, step: 50000, default: 1200000 },
} as const;

export interface ClampNoticeResult {
  clampedValue: number;
  notice: string | null;
}

/**
 * Universal validator that parses an input draft, clamps it to [min, max],
 * and returns both the clamped numeric value and an accessible user notice.
 * Covers: empty fields, below min, above max, and invalid/NaN input.
 */
export function computeClampNotice({
  raw,
  min,
  max,
  label,
  fallback,
  isCurrency = false,
  unit = '',
  precision = 0,
}: {
  raw: string;
  min: number;
  max: number;
  label: string;
  fallback: number;
  isCurrency?: boolean;
  unit?: string;
  precision?: number;
}): ClampNoticeResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return {
      clampedValue: fallback,
      notice: 'Field was empty — restored previous value',
    };
  }

  // Strip currency symbols (₹, $), percent signs (%), and thousand commas (,)
  const clean = trimmed.replace(/[₹$,%]/g, '').trim();
  const parsed = Number(clean);

  if (isNaN(parsed) || parsed <= 0) {
    return {
      clampedValue: fallback,
      notice: `Invalid ${label} — restored previous value`,
    };
  }

  const factor = Math.pow(10, precision);
  const rounded = Math.round(parsed * factor) / factor;

  const minFormatted = isCurrency ? `₹${formatIndianNumber(min)}` : `${min}${unit ? ` ${unit}` : ''}`;
  const maxFormatted = isCurrency ? `₹${formatIndianNumber(max)}` : `${max}${unit ? ` ${unit}` : ''}`;

  if (rounded < min) {
    return {
      clampedValue: min,
      notice: `Minimum ${label} is ${minFormatted} (adjusted)`,
    };
  }

  if (rounded > max) {
    return {
      clampedValue: max,
      notice: `Maximum ${label} is ${maxFormatted} (adjusted)`,
    };
  }

  return {
    clampedValue: rounded,
    notice: null,
  };
}

/** Clamp Home Loan principal amount between ₹1L and ₹5Cr */
export function clampHomeLoanAmount(val: number | string, fallback: number = HOME_LOAN_BOUNDS.amount.default): number {
  const parsed = typeof val === 'number' ? val : Number(val.replace(/,/g, ''));
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(HOME_LOAN_BOUNDS.amount.max, Math.max(HOME_LOAN_BOUNDS.amount.min, Math.round(parsed)));
}

/** Clamp Home Loan interest rate between 5% and 20% p.a. */
export function clampHomeLoanRate(val: number | string, fallback: number = HOME_LOAN_BOUNDS.rate.default): number {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(parsed) || parsed <= 0) return fallback;
  const clamped = Math.min(HOME_LOAN_BOUNDS.rate.max, Math.max(HOME_LOAN_BOUNDS.rate.min, parsed));
  return Math.round(clamped * 100) / 100;
}

/** Clamp Home Loan tenure between 1 and 30 years */
export function clampHomeLoanTenure(val: number | string, fallback: number = HOME_LOAN_BOUNDS.tenure.default): number {
  const parsed = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(HOME_LOAN_BOUNDS.tenure.max, Math.max(HOME_LOAN_BOUNDS.tenure.min, Math.round(parsed)));
}

/** Clamp SIP monthly investment between ₹500 and ₹10,00,000 (10 Lakhs) */
export function clampSipMonthly(val: number | string, fallback: number = SIP_BOUNDS.monthly.default): number {
  const parsed = typeof val === 'number' ? val : Number(val.replace(/,/g, ''));
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(SIP_BOUNDS.monthly.max, Math.max(SIP_BOUNDS.monthly.min, Math.round(parsed)));
}

/** Clamp SIP expected annual return between 1% and 30% */
export function clampSipRate(val: number | string, fallback: number = SIP_BOUNDS.rate.default): number {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(parsed) || parsed <= 0) return fallback;
  const clamped = Math.min(SIP_BOUNDS.rate.max, Math.max(SIP_BOUNDS.rate.min, parsed));
  return Math.round(clamped * 10) / 10;
}

/** Clamp SIP time horizon between 1 and 40 years */
export function clampSipYears(val: number | string, fallback: number = SIP_BOUNDS.years.default): number {
  const parsed = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(SIP_BOUNDS.years.max, Math.max(SIP_BOUNDS.years.min, Math.round(parsed)));
}

/** Clamp Income Tax gross salary between ₹1L and ₹50Cr */
export function clampIncome(val: number | string, fallback: number = INCOME_TAX_BOUNDS.income.default): number {
  const parsed = typeof val === 'number' ? val : Number(val.replace(/,/g, ''));
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(INCOME_TAX_BOUNDS.income.max, Math.max(INCOME_TAX_BOUNDS.income.min, Math.round(parsed)));
}

/** Clamp age input within customized [min, max] range */
export function clampAge(val: number | string, min: number, max: number, defaultVal: number): number {
  const parsed = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(parsed) || parsed <= 0) return defaultVal;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
