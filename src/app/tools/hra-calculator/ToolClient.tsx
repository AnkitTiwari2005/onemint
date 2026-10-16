'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { Home } from 'lucide-react';
import { cn } from '@/lib/cn';

type CityType = 'metro' | 'non-metro';

// Section 10(13A): HRA exemption = min of:
// (a) Actual HRA received
// (b) 50% of basic (metro) or 40% of basic (non-metro)
// (c) Actual rent paid − 10% of basic salary

export default function HRACalculatorPage() {
  const [basicSalary, setBasicSalary] = useState(50000); // monthly
  const [hraReceived, setHraReceived] = useState(20000); // monthly
  const [rentPaid, setRentPaid] = useState(18000); // monthly
  const [cityType, setCityType] = useState<CityType>('metro');

  const result = useMemo(() => {
    const basic = basicSalary;
    const hra = hraReceived;
    const rent = rentPaid;

    // Three conditions (monthly)
    const condA = hra;
    const condB = cityType === 'metro' ? basic * 0.5 : basic * 0.4;
    const condC = Math.max(0, rent - basic * 0.1);

    const monthlyExemption = Math.min(condA, condB, condC);
    const annualExemption = monthlyExemption * 12;
    const annualHraReceived = hra * 12;
    const taxableHRA = annualHraReceived - annualExemption;

    // Which condition is the binding constraint?
    const minVal = Math.min(condA, condB, condC);
    const bindingCondition =
      minVal === condC ? 'Rent Paid − 10% of Basic' :
      minVal === condB ? `${cityType === 'metro' ? '50' : '40'}% of Basic (city limit)` :
      'Actual HRA Received';

    return {
      condA: Math.round(condA),
      condB: Math.round(condB),
      condC: Math.round(condC),
      monthlyExemption: Math.round(monthlyExemption),
      annualExemption: Math.round(annualExemption),
      annualHraReceived: Math.round(annualHraReceived),
      taxableHRA: Math.round(taxableHRA),
      bindingCondition,
      isFullyExempt: taxableHRA <= 0,
    };
  }, [basicSalary, hraReceived, rentPaid, cityType]);

  const inputs = (
    <div className="space-y-8">
      {/* City type */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">City Type</p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] font-[family-name:var(--font-ui)]">
          {([['metro', '🏙 Metro (50%)'], ['non-metro', '🏘 Non-Metro (40%)']] as [CityType, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCityType(val)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                cityType === val
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-2">
          Metro cities: Mumbai, Delhi, Chennai, Kolkata
        </p>
      </div>

      <SliderInput label="Basic Salary (Monthly)" value={basicSalary} min={10000} max={500000} step={1000} prefix="₹" onChange={setBasicSalary} />
      <SliderInput label="HRA Received (Monthly)" value={hraReceived} min={1000} max={300000} step={1000} prefix="₹" onChange={setHraReceived} hint="Check your payslip" />
      <SliderInput label="Rent Paid (Monthly)" value={rentPaid} min={0} max={300000} step={1000} prefix="₹" onChange={setRentPaid} />
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">Annual HRA Exemption</p>
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.annualExemption)}
        </p>
        <p className="text-sm text-[var(--color-ink-tertiary)] mt-2">
          ₹{formatIndianNumber(result.monthlyExemption)}/month tax-free
        </p>
      </div>

      {/* The 3 conditions breakdown */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-2">
          Exemption = Minimum of 3 Conditions
        </p>
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          {[
            { label: '(A) Actual HRA Received', value: result.condA },
            { label: `(B) ${cityType === 'metro' ? '50' : '40'}% of Basic Salary`, value: result.condB },
            { label: '(C) Rent − 10% of Basic', value: result.condC },
          ].map((row, i) => {
            const isMin = row.value === result.monthlyExemption &&
              [result.condA, result.condB, result.condC].filter(v => v === result.monthlyExemption).length >= 1 &&
              result.bindingCondition.includes(i === 0 ? 'HRA' : i === 1 ? (cityType === 'metro' ? '50' : '40') : 'Rent');
            return (
              <div
                key={row.label}
                className={cn(
                  'flex justify-between items-center px-4 py-3 text-sm',
                  i < 2 ? 'border-b border-[var(--color-border)]' : '',
                  isMin ? 'bg-[var(--color-accent-light)]' : 'bg-[var(--color-surface)]',
                )}
              >
                <span className={cn('text-[var(--color-ink-secondary)]', isMin && 'font-semibold text-[var(--color-accent)]')}>
                  {row.label} {isMin && '← Binding'}
                </span>
                <span className={cn('font-semibold tabular-nums', isMin ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]')}>
                  ₹{formatIndianNumber(row.value)}/mo
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Annual HRA Received</p>
          <p className="text-sm font-bold text-[var(--color-ink)]">₹{formatIndianNumber(result.annualHraReceived)}</p>
        </div>
        <div className={cn(
          'p-3 rounded-xl border text-center',
          result.taxableHRA > 0
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
            : 'bg-[var(--color-cat-finance-light)] border-[var(--color-border)]'
        )}>
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Taxable HRA</p>
          <p className={`text-sm font-bold ${result.taxableHRA > 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--color-cat-finance)]'}`}>
            {result.taxableHRA > 0 ? `₹${formatIndianNumber(result.taxableHRA)}` : '₹0 (Fully Exempt)'}
          </p>
        </div>
      </div>
    </div>
  );

  const callout = 'HRA exemption is available only under the Old Tax Regime. Under the New Tax Regime (FY 2025-26), HRA exemption is not available. Rent receipts and landlord PAN (if annual rent > ₹1L) must be submitted to your employer. If rent is paid to a family member, exemption is typically disallowed.';

  return (
    <CalculatorLayout
      title="HRA Exemption Calculator"
      description="Calculate your House Rent Allowance tax exemption under Section 10(13A). Applicable under the Old Tax Regime for FY 2025-26."
      icon={<Home size={30} />}
      theme="finance"
      results={results}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
