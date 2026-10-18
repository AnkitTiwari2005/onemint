'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/cn';

type CompoundFreq = 'quarterly' | 'monthly' | 'annually' | 'simple';

const FREQ_LABELS: Record<CompoundFreq, string> = {
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  annually: 'Annually',
  simple: 'Simple Interest',
};

const FREQ_N: Record<CompoundFreq, number> = {
  quarterly: 4,
  monthly: 12,
  annually: 1,
  simple: 0, // special case
};

export default function FDCalculatorPage() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(3);
  const [freq, setFreq] = useState<CompoundFreq>('quarterly');

  const result = useMemo(() => {
    const r = rate / 100;
    const n = FREQ_N[freq];

    let maturity: number;
    if (freq === 'simple') {
      maturity = principal * (1 + r * years);
    } else {
      maturity = principal * Math.pow(1 + r / n, n * years);
    }

    const interestEarned = maturity - principal;
    const effectiveYield = (Math.pow(maturity / principal, 1 / years) - 1) * 100;

    // Year-by-year growth
    const chartData: { year: string; Value: number }[] = [];
    for (let y = 1; y <= years; y++) {
      let val: number;
      if (freq === 'simple') {
        val = principal * (1 + r * y);
      } else {
        val = principal * Math.pow(1 + r / n, n * y);
      }
      chartData.push({ year: `Y${y}`, Value: Math.round(val) });
    }

    return {
      maturity: Math.round(maturity),
      interestEarned: Math.round(interestEarned),
      effectiveYield: effectiveYield.toFixed(2),
      chartData,
    };
  }, [principal, rate, years, freq]);

  const inputs = (
    <div className="space-y-8">
      {/* Compounding frequency */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Compounding Frequency</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FREQ_LABELS) as CompoundFreq[]).map(f => (
            <button
              key={f}
              onClick={() => setFreq(f)}
              className={cn(
                'py-2.5 text-sm font-semibold rounded-xl border transition-colors font-[family-name:var(--font-ui)]',
                freq === f
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]'
              )}
            >
              {FREQ_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <SliderInput label="Principal Amount" value={principal} min={10000} max={10000000} step={10000} prefix="₹" onChange={setPrincipal} />
      <SliderInput label="Interest Rate" value={rate} min={4} max={10} step={0.1} suffix="% p.a." onChange={setRate} hint="Most bank FDs: 6.5–8%" />
      <SliderInput label="Tenure" value={years} min={1} max={10} step={1} suffix=" Yr" onChange={setYears} />
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">Maturity Amount</p>
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.maturity)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Principal', value: `₹${formatIndianNumber(principal)}`, neutral: true },
          { label: 'Interest Earned', value: `₹${formatIndianNumber(result.interestEarned)}`, highlight: true },
          { label: 'Effective Yield', value: `${result.effectiveYield}% p.a.` },
          { label: 'Tenure', value: `${years} Year${years > 1 ? 's' : ''}` },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.highlight ? 'text-[var(--color-cat-finance)]' : 'text-[var(--color-ink)]'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Interest vs Principal visual bar */}
      <div>
        <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mb-1.5 font-[family-name:var(--font-ui)]">
          <span>Principal {Math.round((principal / result.maturity) * 100)}%</span>
          <span>Interest {Math.round((result.interestEarned / result.maturity) * 100)}%</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div className="bg-[var(--color-cat-finance)] opacity-50 transition-all" style={{ width: `${(principal / result.maturity) * 100}%` }} />
          <div className="bg-[var(--color-cat-finance)] transition-all flex-1" />
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Year-by-Year Growth</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
          <AreaChart data={result.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
            <Tooltip formatter={rupeesFormatter} />
            <Area type="monotone" dataKey="Value" stroke="var(--color-cat-finance)" fill="url(#fdGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = 'Interest on FDs is fully taxable at your slab rate. If annual interest exceeds ₹40,000 (₹50,000 for senior citizens), TDS at 10% is deducted. Actual post-tax returns will be lower. Tax-saver FDs (5-year) qualify for 80C deduction under the old tax regime.';

  return (
    <CalculatorLayout
      title="FD Calculator"
      description="Calculate your Fixed Deposit maturity amount and interest earned. Compare simple vs compound interest and see year-by-year growth."
      icon={<Landmark size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
