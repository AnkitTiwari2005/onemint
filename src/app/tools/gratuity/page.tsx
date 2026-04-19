'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { Award } from 'lucide-react';

const TAX_EXEMPT_LIMIT = 2000000; // ₹20 Lakhs

export default function GratuityPage() {
  const [basicDa, setBasicDa] = useState(50000);
  const [yearsOfService, setYearsOfService] = useState(10);

  const result = useMemo(() => {
    // Gratuity = (Basic + DA) × 15/26 × Years of Service
    const gratuity = Math.round((basicDa * 15 / 26) * yearsOfService);
    const taxExempt = Math.min(gratuity, TAX_EXEMPT_LIMIT);
    const taxable = Math.max(0, gratuity - TAX_EXEMPT_LIMIT);
    const isEligible = yearsOfService >= 5;
    return { gratuity, taxExempt, taxable, isEligible };
  }, [basicDa, yearsOfService]);

  const inputs = (
    <div className="space-y-8">
      <SliderInput
        label="Basic + DA Salary (Monthly)"
        value={basicDa}
        min={5000}
        max={500000}
        step={1000}
        prefix="₹"
        onChange={setBasicDa}
      />
      <SliderInput
        label="Years of Service"
        value={yearsOfService}
        min={1}
        max={35}
        step={1}
        suffix=" Yr"
        onChange={setYearsOfService}
        hint="Min 5 years for eligibility"
      />
    </div>
  );

  const results = (
    <div className="space-y-4 calc-result">
      {/* Eligibility Banner */}
      <div className={`rounded-xl px-4 py-3 text-sm font-semibold font-[family-name:var(--font-ui)] ${result.isEligible ? 'bg-[var(--color-cat-finance-light)] text-[var(--color-cat-finance)]' : 'bg-[var(--color-cat-food-light)] text-[var(--color-accent-warm)]'}`}>
        {result.isEligible
          ? '✓ Eligible for gratuity (5+ years of service)'
          : `✗ Not yet eligible — need ${5 - yearsOfService} more year(s)`}
      </div>

      <div className="text-center py-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Gratuity Amount</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.gratuity)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Tax-Exempt Portion</p>
          <p className="font-bold text-[var(--color-cat-finance)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.taxExempt)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Taxable Amount</p>
          <p className={`font-bold text-sm font-[family-name:var(--font-ui)] ${result.taxable > 0 ? 'text-[var(--color-accent-warm)]' : 'text-[var(--color-ink-secondary)]'}`}>
            {result.taxable > 0 ? `₹${formatIndianNumber(result.taxable)}` : 'Nil'}
          </p>
        </div>
      </div>

      <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] leading-relaxed">
        Formula: (Basic + DA) × 15/26 × Years of Service. Gratuity is tax-exempt up to ₹20 lakhs under the Payment of Gratuity Act.
      </p>
    </div>
  );

  return (
    <CalculatorLayout
      title="Gratuity Calculator"
      description="Calculate your gratuity amount based on your last drawn salary and years of service. Gratuity is tax-exempt up to ₹20 lakhs."
      icon={<Award size={30} />}
      theme="finance"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
