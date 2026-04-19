import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatIndianNumber } from '@/lib/utils';

/**
 * Type-safe Recharts Tooltip formatter that handles Recharts' `ValueType | undefined`.
 * Usage: <Tooltip formatter={rupeesFormatter} />
 */
export function rupeesFormatter(val: ValueType | undefined): string {
  if (val == null) return '';
  const n = typeof val === 'number' ? val : Number(val);
  return `₹${formatIndianNumber(Math.round(n))}`;
}

/**
 * Type-safe Recharts YAxis tickFormatter.
 * Usage: <YAxis tickFormatter={rupeesTickFormatter} />
 */
export function rupeesTickFormatter(val: number | string): string {
  const n = typeof val === 'number' ? val : Number(val);
  return `₹${formatIndianNumber(n)}`;
}
