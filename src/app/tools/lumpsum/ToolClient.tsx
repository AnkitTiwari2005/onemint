'use client';
import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

const SCENARIOS = [
  { label: 'Conservative', rate: 8,  desc: 'Debt / hybrid' },
  { label: 'Moderate',     rate: 12, desc: 'Diversified equity' },
  { label: 'Aggressive',   rate: 15, desc: 'Small/mid-cap' },
] as const;

const INFLATION_RATE = 6;

export default function LumpsumPage() {
  const [investment, setInvestment]     = useState(100000);
  const [returnRate, setReturnRate]     = useState(12);
  const [years, setYears]               = useState(10);
  const [activeScenario, setActiveScenario] = useState<number | null>(1);

  function handleScenarioClick(idx: number) {
    setActiveScenario(idx);
    setReturnRate(SCENARIOS[idx].rate);
  }
  function handleRateChange(rate: number) {
    setReturnRate(rate);
    const matched = SCENARIOS.findIndex(s => s.rate === rate);
    setActiveScenario(matched === -1 ? null : matched);
  }

  const { futureValue, totalReturns, realValue } = useMemo(() => {
    const fv = investment * Math.pow(1 + returnRate / 100, years);
    const tr = fv - investment;
    const rv = fv / Math.pow(1 + INFLATION_RATE / 100, years);
    return { futureValue: fv, totalReturns: tr, realValue: rv };
  }, [investment, returnRate, years]);

  const scenarioValues = useMemo(
    () => SCENARIOS.map(s => investment * Math.pow(1 + s.rate / 100, years)),
    [investment, years],
  );

  const chartDataObj = [
    { name: 'Invested', value: investment },
    { name: 'Returns',  value: totalReturns },
  ];

  const inputs = (
    <div className="space-y-6">
      {/* Scenario tabs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-3">Return scenario</p>
        <div className="flex gap-2 flex-wrap">
          {SCENARIOS.map((s, idx) => (
            <button
              key={s.label}
              onClick={() => handleScenarioClick(idx)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                activeScenario === idx
                  ? 'border-[var(--color-cat-finance)] bg-[var(--color-cat-finance-light)] text-[var(--color-cat-finance)]'
                  : 'border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-cat-finance)]'
              }`}
            >
              {s.label} ({s.rate}%)
            </button>
          ))}
          <button
            onClick={() => setActiveScenario(null)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
              activeScenario === null
                ? 'border-[var(--color-cat-finance)] bg-[var(--color-cat-finance-light)] text-[var(--color-cat-finance)]'
                : 'border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-cat-finance)]'
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      <SliderInput label="Total Investment" value={investment} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInvestment} />
      <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={handleRateChange} />
      <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
    </div>
  );

  const results = (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-xs text-[var(--color-ink-secondary)] mb-1">Invested Amount</p>
          <p className="text-xl font-bold">₹{formatIndianNumber(investment)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[var(--color-ink-secondary)] mb-1">Estimated Returns</p>
          <p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalReturns))}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-[var(--color-border)] text-center">
        <p className="text-sm text-[var(--color-ink-secondary)] mb-1">Total Value at {returnRate}%</p>
        <p className="text-3xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(futureValue))}</p>
      </div>
      <div className="pt-3 border-t border-[var(--color-border)] text-center">
        <p className="text-xs text-[var(--color-ink-secondary)] mb-1">Inflation-adjusted real value (at {INFLATION_RATE}% inflation)</p>
        <p className="text-xl font-semibold text-[var(--color-ink-secondary)]">₹{formatIndianNumber(Math.round(realValue))}</p>
      </div>
      {/* Scenario comparison */}
      <div className="pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-3">Range of outcomes</p>
        <div className="space-y-2">
          {SCENARIOS.map((s, idx) => (
            <div key={s.label} className="flex justify-between text-sm items-center">
              <span className="text-[var(--color-ink-secondary)]">{s.label} ({s.rate}%)</span>
              <span className="font-[family-name:var(--font-mono)] font-semibold">₹{formatIndianNumber(Math.round(scenarioValues[idx]))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const chart = (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartDataObj} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {chartDataObj.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RechartsTooltip formatter={(val: any) => '₹' + formatIndianNumber(Math.round(Number(val)))} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const callout = (
    <div className="flex gap-3">
      <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={18} />
      <div className="text-xs space-y-1 text-[var(--color-ink-secondary)]">
        <p className="font-bold text-[var(--color-ink)]">These are projections, not guarantees</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Actual returns vary year to year and are not fixed.</li>
          <li>Expense ratios (0.5–2% p.a.) and taxes (LTCG at 12.5% above ₹1.25 lakh) will reduce real gains.</li>
          <li>Past market performance does not guarantee future results.</li>
          <li>Consult a SEBI-registered investment advisor before investing.</li>
        </ul>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Lumpsum Calculator"
      description="Calculate the future value of a one-time investment. Compare conservative, moderate, and aggressive return scenarios side by side."
      icon={<TrendingUp size={32} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
