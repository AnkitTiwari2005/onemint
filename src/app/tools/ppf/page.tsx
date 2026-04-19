'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Landmark } from 'lucide-react';

const PPF_RATE = 7.1;

interface YearRow {
  year: number;
  opening: number;
  deposit: number;
  interest: number;
  closing: number;
}

export default function PPFPage() {
  const [annualInvestment, setAnnualInvestment] = useState(150000);
  const [years, setYears] = useState(15);

  const { totalInvested, totalInterest, maturityValue, yearData } = useMemo(() => {
    const rate = PPF_RATE / 100;
    let balance = 0;
    let invested = 0;
    const rows: YearRow[] = [];

    for (let y = 1; y <= years; y++) {
      const opening = balance;
      const deposit = annualInvestment;
      const interest = Math.round((opening + deposit) * rate);
      balance = opening + deposit + interest;
      invested += deposit;
      rows.push({ year: y, opening: Math.round(opening), deposit, interest, closing: Math.round(balance) });
    }

    return {
      totalInvested: invested,
      totalInterest: Math.round(balance - invested),
      maturityValue: Math.round(balance),
      yearData: rows,
    };
  }, [annualInvestment, years]);

  const chartData = yearData.map(r => ({
    year: `Y${r.year}`,
    Invested: Math.round(r.year * annualInvestment),
    'Total Corpus': r.closing,
  }));

  const inputs = (
    <div className="space-y-8">
      <SliderInput label="Annual Investment" value={annualInvestment} min={500} max={150000} step={500} prefix="₹" onChange={setAnnualInvestment} />
      <SliderInput label="Investment Period" value={years} min={15} max={50} step={5} suffix=" Yr" onChange={setYears} hint="Min 15 years (PPF rule)" />
      <div className="p-3 rounded-xl bg-[var(--color-cat-finance-light)] border border-[var(--color-border)] text-sm font-[family-name:var(--font-ui)] text-[var(--color-cat-finance)]">
        <strong>Current PPF rate: 7.1% p.a.</strong> (Government of India, Q1 FY2026-27)
      </div>
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result">
      <div className="text-center pb-5 border-b border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Maturity Value</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(maturityValue)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Total Invested</p>
          <p className="text-lg font-bold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">₹{formatIndianNumber(totalInvested)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Interest Earned</p>
          <p className="text-lg font-bold text-[var(--color-cat-finance)] font-[family-name:var(--font-ui)]">₹{formatIndianNumber(totalInterest)}</p>
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Corpus Growth Over Time</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ink-tertiary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-ink-tertiary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
            <Tooltip formatter={rupeesFormatter} />
            <Legend />
            <Area type="monotone" dataKey="Invested" stroke="var(--color-ink-tertiary)" fill="url(#investGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Total Corpus" stroke="var(--color-cat-finance)" fill="url(#corpusGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = (
    <div className="flex gap-3">
      <span className="text-lg shrink-0">🏛️</span>
      <div>
        <p className="font-semibold text-[var(--color-ink)] mb-1">PPF is completely Tax-Free (EEE Status)</p>
        <p className="text-[var(--color-ink-secondary)]">Investments qualify for deduction under Section 80C. Interest earned and maturity amount are both 100% tax-free.</p>
      </div>
    </div>
  );

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-[family-name:var(--font-ui)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr className="text-left text-xs text-[var(--color-ink-tertiary)] uppercase tracking-wider border-b border-[var(--color-border)]">
            <th className="px-4 py-3">Year</th>
            <th className="px-4 py-3 text-right">Opening Balance</th>
            <th className="px-4 py-3 text-right">Deposit</th>
            <th className="px-4 py-3 text-right">Interest (7.1%)</th>
            <th className="px-4 py-3 text-right">Closing Balance</th>
          </tr>
        </thead>
        <tbody>
          {yearData.map((row, i) => (
            <tr key={row.year} className={i % 2 === 0 ? 'bg-[var(--color-surface-alt)]' : ''}>
              <td className="px-4 py-2.5 font-medium text-[var(--color-ink)]">Year {row.year}</td>
              <td className="px-4 py-2.5 text-right text-[var(--color-ink-secondary)]">₹{formatIndianNumber(row.opening)}</td>
              <td className="px-4 py-2.5 text-right text-[var(--color-ink-secondary)]">₹{formatIndianNumber(row.deposit)}</td>
              <td className="px-4 py-2.5 text-right text-[var(--color-cat-finance)]">₹{formatIndianNumber(row.interest)}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-[var(--color-ink)]">₹{formatIndianNumber(row.closing)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <CalculatorLayout
      title="PPF Calculator"
      description="Calculate your Public Provident Fund maturity value with the current 7.1% interest rate. PPF offers guaranteed, tax-free returns under the EEE status."
      icon={<Landmark size={30} />}
      theme="finance"
      results={results}
      chart={chart}
      callout={callout}
      table={table}
    >
      {inputs}
    </CalculatorLayout>
  );
}
