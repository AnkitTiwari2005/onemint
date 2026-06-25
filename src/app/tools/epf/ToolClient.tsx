'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Briefcase } from 'lucide-react';

const EPF_INTEREST = 8.15;
const EMPLOYEE_RATE = 0.12;
const EMPLOYER_RATE = 0.0367; // 3.67% goes to EPF, rest to EPS

export default function EPFPage() {
  const [basicSalary, setBasicSalary] = useState(30000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [age, setAge] = useState(28);
  const [annualHike, setAnnualHike] = useState(7);

  const result = useMemo(() => {
    const yearsToRetire = Math.max(0, 58 - age);
    const monthlyInterestRate = EPF_INTEREST / 100 / 12;
    let balance = currentBalance;
    let employeeTotal = 0;
    let employerTotal = 0;
    let interestTotal = 0;
    let currentSalary = basicSalary;
    const chartRows: { year: string; Employee: number; Employer: number; Interest: number }[] = [];

    for (let y = 1; y <= yearsToRetire; y++) {
      const empMonthly = Math.round(currentSalary * EMPLOYEE_RATE);
      const erMonthly = Math.round(currentSalary * EMPLOYER_RATE);
      let yearInterest = 0;

      for (let m = 1; m <= 12; m++) {
        balance += empMonthly + erMonthly;
        const interest = Math.round(balance * monthlyInterestRate);
        balance += interest;
        yearInterest += interest;
      }

      const empAnnual = empMonthly * 12;
      const erAnnual = erMonthly * 12;
      employeeTotal += empAnnual;
      employerTotal += erAnnual;
      interestTotal += yearInterest;

      if (y % 5 === 0 || y === yearsToRetire) {
        chartRows.push({ year: `Y${y}`, Employee: employeeTotal, Employer: employerTotal, Interest: interestTotal });
      }
      currentSalary = Math.round(currentSalary * (1 + annualHike / 100));
    }

    return { corpus: Math.round(balance), employeeTotal, employerTotal, interestTotal, chartRows };
  }, [basicSalary, currentBalance, age, annualHike]);

  const inputs = (
    <div className="space-y-8">
      <SliderInput label="Basic Salary (Monthly)" value={basicSalary} min={5000} max={100000} step={1000} prefix="₹" onChange={setBasicSalary} />
      <SliderInput label="Current EPF Balance" value={currentBalance} min={0} max={5000000} step={10000} prefix="₹" onChange={setCurrentBalance} />
      <SliderInput label="Your Age" value={age} min={18} max={57} step={1} suffix=" yrs" onChange={setAge} />
      <SliderInput label="Annual Salary Hike" value={annualHike} min={0} max={15} step={1} suffix="%" onChange={setAnnualHike} />
      <div className="p-3 rounded-xl bg-[var(--color-cat-finance-light)] border border-[var(--color-border)] text-sm font-[family-name:var(--font-ui)] text-[var(--color-cat-finance)]">
        <strong>Current EPF interest rate: 8.15% p.a.</strong> (EPFO, FY2025-26)
      </div>
    </div>
  );

  const results = (
    <div className="space-y-4 calc-result">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">EPF Corpus at Age 58</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.corpus)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Your Contribution</p>
          <p className="font-bold text-[var(--color-ink)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.employeeTotal)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Employer Contribution</p>
          <p className="font-bold text-[var(--color-ink)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.employerTotal)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] col-span-2">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Total Interest Earned (8.15%)</p>
          <p className="font-bold text-[var(--color-cat-finance)] font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.interestTotal)}</p>
        </div>
      </div>
    </div>
  );

  const chart = result.chartRows.length > 0 ? (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Contribution Breakdown</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.chartRows} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
            <Tooltip formatter={rupeesFormatter} />
            <Legend />
            <Bar dataKey="Employee" fill="var(--color-cat-finance)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Employer" fill="var(--color-cat-technology)" stackId="a" />
            <Bar dataKey="Interest" fill="var(--color-accent-gold)" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  ) : null;

  return (
    <CalculatorLayout
      title="EPF Calculator"
      description="Calculate your Employee Provident Fund corpus at retirement (age 58), including your contributions, employer contributions, and interest at 8.15% p.a."
      icon={<Briefcase size={30} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
