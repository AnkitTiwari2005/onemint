'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { TrendingDown } from 'lucide-react';

const InflationChart = dynamic(() => import('./InflationChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse bg-[var(--color-surface-alt)] rounded-xl" />,
});

export default function InflationCalculatorPage() {
  const [amount, setAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    // Future cost of today's amount: what you'll need to maintain same purchasing power
    const futureCost = amount * Math.pow(1 + inflationRate / 100, years);
    // Purchasing power loss: what today's amount will "feel like" in the future
    const futurePurchasingPower = amount / Math.pow(1 + inflationRate / 100, years);
    const purchasingPowerLoss = amount - futurePurchasingPower;
    const purchasingPowerLossPct = (purchasingPowerLoss / amount) * 100;

    // Rule of 70: years to halve purchasing power
    const halfLifeYears = Math.round(70 / inflationRate);

    // Year-by-year chart: future cost line + purchasing power line
    const chartData: { year: string; 'Cost of Living': number; 'Purchasing Power': number }[] = [];
    for (let y = 1; y <= years; y++) {
      chartData.push({
        year: `Y${y}`,
        'Cost of Living': Math.round(amount * Math.pow(1 + inflationRate / 100, y)),
        'Purchasing Power': Math.round(amount / Math.pow(1 + inflationRate / 100, y)),
      });
    }

    return {
      futureCost: Math.round(futureCost),
      futurePurchasingPower: Math.round(futurePurchasingPower),
      purchasingPowerLoss: Math.round(purchasingPowerLoss),
      purchasingPowerLossPct: purchasingPowerLossPct.toFixed(1),
      halfLifeYears,
      chartData,
    };
  }, [amount, inflationRate, years]);

  const inputs = (
    <div className="space-y-8">
      <SliderInput label="Amount Today" value={amount} min={1000} max={10000000} step={1000} prefix="₹" onChange={setAmount} />
      <SliderInput
        label="Inflation Rate"
        value={inflationRate}
        min={2}
        max={15}
        step={0.5}
        suffix="% p.a."
        onChange={setInflationRate}
        hint="India avg: 5–7%"
      />
      <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />

      {/* India context */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-2">India Inflation Reference</p>
        <div className="grid grid-cols-2 gap-2 text-xs font-[family-name:var(--font-ui)]">
          {[
            { label: 'CPI (2024-25 avg)', val: '~4.8%' },
            { label: 'Education inflation', val: '~10-12%' },
            { label: 'Medical inflation', val: '~14%' },
            { label: 'Food & groceries', val: '~6-8%' },
          ].map(r => (
            <div key={r.label} className="flex justify-between gap-1">
              <span className="text-[var(--color-ink-tertiary)]">{r.label}</span>
              <span className="font-bold text-[var(--color-ink)]">{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">
          What ₹{formatIndianNumber(amount)} today costs in {years} yr{years > 1 ? 's' : ''}
        </p>
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-warm)]">
          ₹{formatIndianNumber(result.futureCost)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Today&apos;s ₹{formatIndianNumber(amount)} will feel like</p>
          <p className="text-sm font-bold text-red-500">₹{formatIndianNumber(result.futurePurchasingPower)}</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] mt-0.5">in real terms</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Purchasing Power Lost</p>
          <p className="text-sm font-bold text-red-500">{result.purchasingPowerLossPct}%</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] mt-0.5">₹{formatIndianNumber(result.purchasingPowerLoss)} eroded</p>
        </div>
      </div>

      {/* Rule of 70 */}
      <div className="rounded-xl border border-[var(--color-accent-warm)] bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
        <p className="text-xs font-semibold text-[var(--color-accent-warm)] uppercase tracking-widest mb-1">Rule of 70</p>
        <p className="text-sm text-[var(--color-ink-secondary)]">
          At <strong>{inflationRate}%</strong> inflation, purchasing power halves every <strong>{result.halfLifeYears} years</strong>.
          Invest in assets that beat inflation to protect your wealth.
        </p>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Cost of Living vs Purchasing Power Over Time</h3>
      <div className="h-[220px]">
        <InflationChart data={result.chartData} />
      </div>
    </div>
  );

  const callout = 'Inflation erodes the real value of money sitting idle in savings. To stay ahead of inflation at 6%, your investments must earn more than 6% annually. Equity mutual funds have historically delivered 10–14% CAGR over 10+ years in India, significantly outpacing inflation.';

  return (
    <CalculatorLayout
      title="Inflation Calculator"
      description="See how inflation erodes the purchasing power of your money over time — and how much more you'll need in the future to maintain the same lifestyle."
      icon={<TrendingDown size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
