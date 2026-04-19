'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { formatIndianNumber } from '@/lib/utils';
import { Laptop } from 'lucide-react';

export default function FreelanceRatePage() {
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState(1200000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState(30);
  const [unpaidWeeks, setUnpaidWeeks] = useState(6);
  const [businessExpenses, setBusinessExpenses] = useState(120000);
  const [taxRate, setTaxRate] = useState(20);
  const [profitMargin, setProfitMargin] = useState(20);

  const result = useMemo(() => {
    const billableWeeks = 52 - unpaidWeeks;
    const annualBillableHours = billableHoursPerWeek * billableWeeks;

    if (annualBillableHours <= 0) return null;

    // Total cost + desired take-home
    const desiredGross = desiredAnnualIncome / (1 - taxRate / 100);
    const totalNeeded = desiredGross + businessExpenses;
    const withMargin = totalNeeded / (1 - profitMargin / 100);

    const hourlyRate = withMargin / annualBillableHours;
    const dailyRate = hourlyRate * 8;
    const weeklyRate = hourlyRate * billableHoursPerWeek;
    const monthlyRate = weeklyRate * 4.33;

    // Hours needed to hit ₹1Cr
    const hoursFor1Cr = 10000000 / hourlyRate;

    return {
      hourlyRate: Math.round(hourlyRate),
      dailyRate: Math.round(dailyRate),
      weeklyRate: Math.round(weeklyRate),
      monthlyRate: Math.round(monthlyRate),
      annualBillableHours,
      billableWeeks,
      hoursFor1Cr: Math.round(hoursFor1Cr),
    };
  }, [desiredAnnualIncome, billableHoursPerWeek, unpaidWeeks, businessExpenses, taxRate, profitMargin]);

  const sliderFn = (val: number, min: number, max: number) =>
    `linear-gradient(to right, var(--color-accent) ${((val - min) / (max - min)) * 100}%, var(--color-surface-alt) ${((val - min) / (max - min)) * 100}%)`;

  const inputs = (
    <div className="space-y-8 font-[family-name:var(--font-ui)]">
      {[
        { label: 'Desired Annual Take-Home', value: desiredAnnualIncome, min: 300000, max: 10000000, step: 50000, setter: setDesiredAnnualIncome, prefix: '₹' },
        { label: 'Billable Hours / Week', value: billableHoursPerWeek, min: 5, max: 60, step: 1, setter: setBillableHoursPerWeek, suffix: ' hrs' },
        { label: 'Unpaid / Vacation Weeks', value: unpaidWeeks, min: 0, max: 20, step: 1, setter: setUnpaidWeeks, suffix: ' wks' },
        { label: 'Annual Business Expenses', value: businessExpenses, min: 0, max: 1000000, step: 10000, setter: setBusinessExpenses, prefix: '₹' },
        { label: 'Income Tax Rate', value: taxRate, min: 0, max: 40, step: 1, setter: setTaxRate, suffix: '%' },
        { label: 'Profit Margin', value: profitMargin, min: 0, max: 50, step: 1, setter: setProfitMargin, suffix: '%' },
      ].map(({ label, value, min, max, step, setter, prefix = '', suffix = '' }) => (
        <div key={label} className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-[var(--color-ink-secondary)]">{label}</label>
            <span className="text-sm font-bold text-[var(--color-ink)]">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => setter(Number(e.target.value))}
            className="w-full" style={{ background: sliderFn(value, min, max) }} />
          <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)]">
            <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
            <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const results = result ? (
    <div className="space-y-4 calc-result font-[family-name:var(--font-ui)]">
      {/* Highlighted hourly rate */}
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Minimum Hourly Rate</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-career)]">
          ₹{formatIndianNumber(result.hourlyRate)}
        </p>
        <p className="text-xs text-[var(--color-ink-tertiary)] mt-1">per hour billable</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Daily Rate (8 hrs)</p>
          <p className="font-bold text-[var(--color-ink)] text-sm">₹{formatIndianNumber(result.dailyRate)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Weekly Rate</p>
          <p className="font-bold text-[var(--color-ink)] text-sm">₹{formatIndianNumber(result.weeklyRate)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Monthly Rate</p>
          <p className="font-bold text-[var(--color-cat-career)] text-sm">₹{formatIndianNumber(result.monthlyRate)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Billable Hours/Year</p>
          <p className="font-bold text-[var(--color-ink)] text-sm">{result.annualBillableHours.toLocaleString('en-IN')} hrs</p>
        </div>
      </div>

      {/* ₹1 Cr target */}
      <div className="bg-[var(--color-cat-career-light)] border border-[var(--color-border)] rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-2">To Earn ₹1 Crore</p>
        <p className="font-bold text-[var(--color-cat-career)] text-lg">{result.hoursFor1Cr.toLocaleString('en-IN')} billable hours</p>
        <p className="text-xs text-[var(--color-ink-secondary)] mt-1">≈ {Math.round(result.hoursFor1Cr / result.annualBillableHours)} year(s) at current rate</p>
      </div>
    </div>
  ) : (
    <div className="text-center py-8 text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Adjust inputs to calculate your rate.</div>
  );

  return (
    <CalculatorLayout
      title="Freelance Rate Calculator"
      description="Calculate the minimum hourly rate you need to charge as a freelancer to meet your income goals, accounting for taxes, expenses, and downtime."
      icon={<Laptop size={30} />}
      theme="career"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
