'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter } from '@/lib/chartUtils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield } from 'lucide-react';

type ChartDataPoint = { name: string; value: number };

export default function NPSPage() {
  const [currentAge, setCurrentAge] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [returnRate, setReturnRate] = useState(10);
  const [annuityRate, setAnnuityRate] = useState(6);
  const [annuityPct, setAnnuityPct] = useState(40);

  const result = useMemo(() => {
    const yearsToRetire = 60 - currentAge;
    const totalMonths = yearsToRetire * 12;
    const monthlyRate = returnRate / 12 / 100;

    // SIP future value formula
    const corpus =
      totalMonths <= 0 ? 0 :
      monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

    const annuityCorpus = corpus * (annuityPct / 100);
    const lumpsum = corpus - annuityCorpus;
    const monthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;
    const totalInvested = monthlyContribution * 12 * yearsToRetire;

    return {
      corpus: Math.round(corpus),
      annuityCorpus: Math.round(annuityCorpus),
      lumpsum: Math.round(lumpsum),
      monthlyPension: Math.round(monthlyPension),
      totalInvested: Math.round(totalInvested),
      yearsToRetire,
    };
  }, [currentAge, monthlyContribution, returnRate, annuityRate, annuityPct]);

  const chartData: ChartDataPoint[] = [
    { name: `Lumpsum (${100 - annuityPct}%)`, value: result.lumpsum },
    { name: `Annuity (${annuityPct}%)`, value: result.annuityCorpus },
  ];
  const COLORS = ['var(--color-cat-finance)', 'var(--color-cat-technology)'];

  const inputs = (
    <div className="space-y-8">
      <SliderInput label="Current Age" value={currentAge} min={18} max={59} step={1} suffix=" yrs" onChange={setCurrentAge} />
      <SliderInput label="Monthly Contribution" value={monthlyContribution} min={500} max={100000} step={500} prefix="₹" onChange={setMonthlyContribution} />
      <SliderInput label="Expected Return Rate" value={returnRate} min={8} max={14} step={0.5} suffix="%" onChange={setReturnRate} />
      <SliderInput label="Annuity Rate" value={annuityRate} min={4} max={8} step={0.5} suffix="%" onChange={setAnnuityRate} />
      <SliderInput label="Annuity Portion" value={annuityPct} min={40} max={100} step={5} suffix="%" onChange={setAnnuityPct} hint="Min 40% by law" />
    </div>
  );

  const results = (
    <div className="space-y-4 calc-result">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Total Corpus at Age 60</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.corpus)}
        </p>
        <p className="text-xs text-[var(--color-ink-tertiary)] mt-1 font-[family-name:var(--font-ui)]">After {result.yearsToRetire} years</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Lumpsum Withdrawal</p>
          <p className="font-bold text-[var(--color-ink)] font-[family-name:var(--font-ui)] text-sm">₹{formatIndianNumber(result.lumpsum)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Monthly Pension</p>
          <p className="font-bold text-[var(--color-cat-finance)] font-[family-name:var(--font-ui)] text-sm">₹{formatIndianNumber(result.monthlyPension)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] col-span-2">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Total Amount Invested</p>
          <p className="font-bold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.totalInvested)}</p>
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Corpus Distribution</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value">
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={rupeesFormatter} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = (
    <div className="flex gap-3">
      <span className="text-lg shrink-0">💡</span>
      <div>
        <p className="font-semibold text-[var(--color-ink)] mb-1">Extra ₹50,000 Tax Deduction</p>
        <p className="text-[var(--color-ink-secondary)]">NPS Tier 1 contributions qualify for an additional ₹50,000 deduction under Section 80CCD(1B), over and above the ₹1.5L limit of 80C.</p>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="NPS Calculator"
      description="Plan your retirement with the National Pension System. Calculate your corpus, lumpsum withdrawal, and estimated monthly pension."
      icon={<Shield size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
