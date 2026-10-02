'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter } from '@/lib/chartUtils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield } from 'lucide-react';

type ChartDataPoint = { name: string; value: number };
type SubscriberType = 'government' | 'private';

export default function NPSPage() {
  const [subscriberType, setSubscriberType] = useState<SubscriberType>('government');
  const [currentAge, setCurrentAge] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [returnRate, setReturnRate] = useState(10);
  const [annuityRate, setAnnuityRate] = useState(6);
  const [annuityPct, setAnnuityPct] = useState(40);

  // Per PFRDA Exit Regulations (consolidated July 20, 2026):
  // Government subscribers: mandatory 40% annuity minimum upon superannuation.
  // Non-Government / All-Citizen Model: mandatory 20% minimum if corpus > ₹5L; 100% lump sum if ≤ ₹5L.
  const annuityMin = subscriberType === 'government' ? 40 : 20;

  const result = useMemo(() => {
    const yearsToRetire = 60 - currentAge;
    const totalMonths = yearsToRetire * 12;
    const monthlyRate = returnRate / 12 / 100;

    // SIP future value formula
    const corpus =
      totalMonths <= 0 ? 0 :
      monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

    // For non-govt subscribers: if corpus ≤ ₹5,00,000, full lump sum is permitted
    const effectiveAnnuityPct = (subscriberType === 'private' && corpus <= 500000) ? 0 : annuityPct;

    const annuityCorpus = corpus * (effectiveAnnuityPct / 100);
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
      effectiveAnnuityPct,
    };
  }, [currentAge, monthlyContribution, returnRate, annuityRate, annuityPct, subscriberType]);

  const chartData: ChartDataPoint[] = [
    { name: `Lumpsum (${100 - result.effectiveAnnuityPct}%)`, value: result.lumpsum },
    { name: `Annuity (${result.effectiveAnnuityPct}%)`, value: result.annuityCorpus },
  ];
  const COLORS = ['var(--color-cat-finance)', 'var(--color-cat-technology)'];

  const inputs = (
    <div className="space-y-8">
      {/* Subscriber type selector */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">
          Subscriber Type
        </p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] font-[family-name:var(--font-ui)]">
          {([['government', 'Government'], ['private', 'Non-Government / Citizen']] as [SubscriberType, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setSubscriberType(v);
                // Enforce correct minimum when switching subscriber type
                if (v === 'government' && annuityPct < 40) setAnnuityPct(40);
                if (v === 'private' && annuityPct < 20) setAnnuityPct(20);
              }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${subscriberType === v ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-ui)]">
          {subscriberType === 'government'
            ? 'Mandatory minimum: 40% annuity (PFRDA Exit Regulations, July 2026)'
            : 'Mandatory minimum: 20% annuity if corpus > ₹5L; 100% lump sum permitted if corpus ≤ ₹5L'}
        </p>
      </div>

      <SliderInput label="Current Age" value={currentAge} min={18} max={59} step={1} suffix=" yrs" onChange={setCurrentAge} />
      <SliderInput label="Monthly Contribution" value={monthlyContribution} min={500} max={100000} step={500} prefix="₹" onChange={setMonthlyContribution} />
      <SliderInput label="Expected Return Rate" value={returnRate} min={8} max={14} step={0.5} suffix="%" onChange={setReturnRate} />
      <SliderInput label="Annuity Rate" value={annuityRate} min={4} max={8} step={0.5} suffix="%" onChange={setAnnuityRate} />
      <SliderInput
        label="Annuity Portion"
        value={annuityPct}
        min={annuityMin}
        max={100}
        step={5}
        suffix="%"
        onChange={setAnnuityPct}
        hint={`Min ${annuityMin}% by law for ${subscriberType === 'government' ? 'Government' : 'Non-Government'} subscribers`}
      />
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
        <p className="font-semibold text-[var(--color-ink)] mb-1">Extra ₹50,000 Tax Deduction (Old Regime Only)</p>
        <p className="text-[var(--color-ink-secondary)]">NPS Tier 1 contributions qualify for an additional ₹50,000 deduction under Section 80CCD(1B), over and above the ₹1.5L limit of 80C. <strong>This deduction is available exclusively under the Old Tax Regime</strong> and is not available if you have opted for the New Tax Regime.</p>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="NPS Calculator"
      description="Plan your retirement with the National Pension System. Select your subscriber type, calculate your corpus, lumpsum withdrawal, and estimated monthly pension per PFRDA Exit Regulations (July 2026)."
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
