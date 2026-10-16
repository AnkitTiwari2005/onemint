'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Target } from 'lucide-react';

const PRESETS = [
  { label: 'Home Down Payment', amount: 2000000, years: 5 },
  { label: "Child's Education", amount: 5000000, years: 15 },
  { label: 'Emergency Fund', amount: 600000, years: 3 },
  { label: 'Retirement', amount: 50000000, years: 25 },
];

export default function GoalSIPPage() {
  const [targetAmount, setTargetAmount] = useState(2000000);
  const [years, setYears] = useState(5);
  const [returnRate, setReturnRate] = useState(12);

  const result = useMemo(() => {
    const r = returnRate / 100 / 12;
    const n = years * 12;

    // Reverse SIP formula: PMT = FV * r / ((1+r)^n - 1) / (1+r)
    const monthlySIP = r === 0
      ? targetAmount / n
      : (targetAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));

    const totalInvested = monthlySIP * n;
    const totalGains = targetAmount - totalInvested;

    // Year-by-year SIP corpus growth
    const chartData: { year: string; 'Invested': number; 'Total Value': number }[] = [];
    for (let y = 1; y <= years; y++) {
      const ny = y * 12;
      const corpus = r === 0
        ? monthlySIP * ny
        : monthlySIP * ((Math.pow(1 + r, ny) - 1) / r) * (1 + r);
      chartData.push({
        year: `Y${y}`,
        'Invested': Math.round(monthlySIP * ny),
        'Total Value': Math.round(corpus),
      });
    }

    return {
      monthlySIP: Math.round(monthlySIP),
      totalInvested: Math.round(totalInvested),
      totalGains: Math.round(totalGains),
      wealthRatio: ((targetAmount / totalInvested) * 100 - 100).toFixed(0),
      chartData,
    };
  }, [targetAmount, years, returnRate]);

  const inputs = (
    <div className="space-y-8">
      {/* Goal presets */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Quick Goal Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setTargetAmount(p.amount); setYears(p.years); }}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors font-[family-name:var(--font-ui)] text-left leading-tight"
            >
              <span className="block font-bold text-[var(--color-ink)]">{p.label}</span>
              <span>₹{formatIndianNumber(p.amount)} · {p.years}y</span>
            </button>
          ))}
        </div>
      </div>

      <SliderInput label="Target Amount" value={targetAmount} min={100000} max={100000000} step={100000} prefix="₹" onChange={setTargetAmount} />
      <SliderInput label="Time to Goal" value={years} min={1} max={30} step={1} suffix=" Yr" onChange={setYears} />
      <SliderInput label="Expected Return" value={returnRate} min={6} max={20} step={0.5} suffix="% p.a." onChange={setReturnRate} hint="Equity MF avg: 10–14%" />
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">Monthly SIP Required</p>
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.monthlySIP)}
        </p>
        <p className="text-sm text-[var(--color-ink-tertiary)] mt-2">
          to reach ₹{formatIndianNumber(targetAmount)} in {years} year{years > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Invested', value: `₹${formatIndianNumber(result.totalInvested)}` },
          { label: 'Total Gains', value: `₹${formatIndianNumber(result.totalGains)}`, highlight: true },
          { label: 'Returns on Invested', value: `${result.wealthRatio}%`, highlight: true },
          { label: 'Annual Rate', value: `${returnRate}% p.a.` },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.highlight ? 'text-[var(--color-cat-finance)]' : 'text-[var(--color-ink)]'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Corpus Growth vs Amount Invested</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={result.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
            <Tooltip formatter={rupeesFormatter} />
            <Area type="monotone" dataKey="Invested" stroke="var(--color-accent-warm)" fill="var(--color-accent-warm)" fillOpacity={0.1} strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Total Value" stroke="var(--color-cat-finance)" fill="url(#goalGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = 'Returns are estimates based on a constant annual rate. Equity mutual fund returns fluctuate and are not guaranteed. Start early — ₹1,000/month for 25 years at 12% grows more than ₹3,000/month for 10 years. Past performance is not indicative of future results.';

  return (
    <CalculatorLayout
      title="Goal SIP Calculator"
      description="Find out exactly how much you need to invest every month to reach any financial goal — home, education, retirement, or any corpus target."
      icon={<Target size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
