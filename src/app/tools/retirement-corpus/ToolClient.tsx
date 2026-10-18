'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sunset } from 'lucide-react';

export default function RetirementCorpusPage() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000); // today's value
  const [inflationRate, setInflationRate] = useState(6);
  const [preRetirementReturn, setPreRetirementReturn] = useState(12);
  const [postRetirementReturn, setPostRetirementReturn] = useState(7);

  const result = useMemo(() => {
    const yearsToRetire = retirementAge - currentAge;
    const retirementDuration = lifeExpectancy - retirementAge;

    if (yearsToRetire <= 0 || retirementDuration <= 0) {
      return null;
    }

    // Monthly expenses at retirement (inflation-adjusted)
    const monthlyExpensesAtRetirement = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetire);
    const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

    // Corpus needed at retirement (Present Value of an annuity for retirementDuration years)
    // Using real (inflation-adjusted) post-retirement return rate
    // Formula: real_r = (1 + nominal) / (1 + inflation) - 1
    const r = (1 + postRetirementReturn / 100) / (1 + inflationRate / 100) - 1;
    const n = retirementDuration;
    // PV = PMT * [1 - (1+r)^-n] / r  (annual annuity)
    const corpusNeeded = r > 0
      ? annualExpensesAtRetirement * (1 - Math.pow(1 + r, -n)) / r
      : annualExpensesAtRetirement * n;

    // Monthly SIP needed to build corpus in yearsToRetire years
    const monthlyR = preRetirementReturn / 100 / 12;
    const totalMonths = yearsToRetire * 12;
    const monthlySIP = monthlyR === 0
      ? corpusNeeded / totalMonths
      : (corpusNeeded * monthlyR) / ((Math.pow(1 + monthlyR, totalMonths) - 1) * (1 + monthlyR));

    // Year-by-year corpus build-up chart (pre-retirement)
    const chartData: { year: number; Corpus: number }[] = [];
    for (let y = 1; y <= yearsToRetire; y++) {
      const ny = y * 12;
      const corpus = monthlyR === 0
        ? monthlySIP * ny
        : monthlySIP * ((Math.pow(1 + monthlyR, ny) - 1) / monthlyR) * (1 + monthlyR);
      chartData.push({ year: currentAge + y, Corpus: Math.round(corpus) });
    }

    return {
      yearsToRetire,
      retirementDuration,
      monthlyExpensesAtRetirement: Math.round(monthlyExpensesAtRetirement),
      corpusNeeded: Math.round(corpusNeeded),
      monthlySIP: Math.round(monthlySIP),
      totalInvested: Math.round(monthlySIP * totalMonths),
      wealthCreated: Math.round(corpusNeeded - monthlySIP * totalMonths),
      chartData,
    };
  }, [currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflationRate, preRetirementReturn, postRetirementReturn]);

  const inputs = (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current Age', value: currentAge, min: 18, max: 55, set: setCurrentAge, suffix: ' yr' },
          { label: 'Retire At', value: retirementAge, min: currentAge + 1, max: 70, set: setRetirementAge, suffix: ' yr' },
          { label: 'Life Expectancy', value: lifeExpectancy, min: retirementAge + 5, max: 100, set: setLifeExpectancy, suffix: ' yr' },
        ].map(({ label, value, min, max, set, suffix }) => (
          <div key={label} className="text-center">
            <label className="text-xs font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] block mb-2">{label}</label>
            <input
              type="number"
              value={value}
              min={min}
              max={max}
              onChange={e => set(Math.min(max, Math.max(min, Number(e.target.value))))}
              className="w-full text-center border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-ink)] font-bold text-lg py-2.5 font-[family-name:var(--font-ui)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">{suffix}</span>
          </div>
        ))}
      </div>

      <SliderInput label="Monthly Expenses Today" value={monthlyExpenses} min={10000} max={500000} step={5000} prefix="₹" onChange={setMonthlyExpenses} hint="Current cost of living" />

      <div className="grid grid-cols-1 gap-6">
        <SliderInput label="Inflation Rate" value={inflationRate} min={3} max={12} step={0.5} suffix="% p.a." onChange={setInflationRate} hint="India avg: 5–7%" />
        <SliderInput label="Pre-Retirement Return" value={preRetirementReturn} min={6} max={18} step={0.5} suffix="% p.a." onChange={setPreRetirementReturn} hint="Equity MF expected" />
        <SliderInput label="Post-Retirement Return" value={postRetirementReturn} min={4} max={12} step={0.5} suffix="% p.a." onChange={setPostRetirementReturn} hint="Debt/hybrid expected" />
      </div>
    </div>
  );

  if (!result) {
    return (
      <CalculatorLayout
        title="Retirement Corpus Calculator"
        description="Calculate exactly how much you need to retire comfortably — and the monthly SIP to get there."
        icon={<Sunset size={30} />}
        theme="finance"
        results={<div className="text-center py-8 text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Adjust age inputs to calculate.</div>}
      >
        {inputs}
      </CalculatorLayout>
    );
  }

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      {/* Hero: corpus needed */}
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">Corpus Needed at Retirement</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.corpusNeeded)}
        </p>
        <p className="text-sm text-[var(--color-ink-tertiary)] mt-2">
          To fund {result.retirementDuration} years of retirement
        </p>
      </div>

      {/* SIP */}
      <div className="rounded-xl bg-[var(--color-cat-finance-light)] border border-[var(--color-border)] p-4 text-center">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Monthly SIP Required Now</p>
        <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.monthlySIP)}
        </p>
        <p className="text-xs text-[var(--color-ink-tertiary)] mt-1">
          for {result.yearsToRetire} years at {preRetirementReturn}% p.a.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Monthly Expenses at Retirement', value: `₹${formatIndianNumber(result.monthlyExpensesAtRetirement)}` },
          { label: 'Years to Retire', value: `${result.yearsToRetire} years` },
          { label: 'Total Amount Invested', value: `₹${formatIndianNumber(result.totalInvested)}` },
          { label: 'Wealth Created by Markets', value: `₹${formatIndianNumber(result.wealthCreated)}`, highlight: true },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 leading-tight">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.highlight ? 'text-[var(--color-cat-finance)]' : 'text-[var(--color-ink)]'}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Corpus Growth Year by Year</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={result.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="retireGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: 'Age', position: 'insideBottomRight', offset: -4, fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
            <Tooltip formatter={rupeesFormatter} labelFormatter={(l) => `Age ${l}`} />
            <ReferenceLine y={result.corpusNeeded} stroke="var(--color-accent-warm)" strokeDasharray="4 2" label={{ value: 'Target', position: 'right', fontSize: 10, fill: 'var(--color-accent-warm)' }} />
            <Area type="monotone" dataKey="Corpus" stroke="var(--color-cat-finance)" fill="url(#retireGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = `Assumes monthly expenses grow at ${inflationRate}% inflation until retirement at age ${retirementAge}. Post-retirement corpus earns ${postRetirementReturn}% p.a. (annuity/debt). Actual corpus requirement may vary based on healthcare costs, lifestyle, and dependents. Start early — every year of delay significantly increases the required SIP.`;

  return (
    <CalculatorLayout
      title="Retirement Corpus Calculator"
      description="Calculate exactly how much corpus you need to retire comfortably and the monthly SIP required to reach it — accounting for inflation, investment returns, and life expectancy."
      icon={<Sunset size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
