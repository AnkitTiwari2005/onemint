'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/cn';

type TaxRegime = 'new' | 'old';

function calcIncomeTax(taxableIncome: number, regime: TaxRegime): number {
  if (taxableIncome <= 0) return 0;

  if (regime === 'new') {
    // FY 2025-26 — Budget 2025 new regime slabs
    // 87A rebate: no tax if income after std deduction ≤ ₹12L
    if (taxableIncome <= 1200000) return 0;
    let tax = 0;
    if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.3;
    if (taxableIncome > 2000000) tax += (Math.min(taxableIncome, 2400000) - 2000000) * 0.25;
    if (taxableIncome > 1600000) tax += (Math.min(taxableIncome, 2000000) - 1600000) * 0.2;
    if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1600000) - 1200000) * 0.15;
    if (taxableIncome > 800000)  tax += (Math.min(taxableIncome, 1200000) - 800000) * 0.1;
    if (taxableIncome > 400000)  tax += (Math.min(taxableIncome, 800000) - 400000) * 0.05;
    return Math.round(tax * 1.04); // 4% cess
  } else {
    // Old regime FY 2025-26 — unchanged from prior year
    // 87A rebate: no tax if income ≤ ₹5L
    if (taxableIncome <= 500000) return 0;
    let tax = 0;
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.3;
    if (taxableIncome > 500000)  tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.2;
    if (taxableIncome > 250000)  tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
    return Math.round(tax * 1.04); // 4% cess
  }
}

export default function TakeHomeSalaryPage() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [regime, setRegime] = useState<TaxRegime>('new');
  // Old regime: user-declared 80C investments (EPF is added automatically on top)
  const [extra80C, setExtra80C] = useState(50000);

  const result = useMemo(() => {
    const basic = ctc * (basicPct / 100);

    // Employer costs (included in CTC, not part of in-hand)
    const employerEpf = basic * 0.12;
    const gratuity = basic * 0.0481; // 4.81% of basic per Payment of Gratuity Act

    // Gross salary = CTC minus employer-side costs
    const grossSalary = ctc - employerEpf - gratuity;

    // Statutory deductions from gross
    const employeeEpf = basic * 0.12;
    const professionalTax = 2400; // ₹200/month statutory maximum

    // Taxable income calculation
    const stdDeduction = 75000; // ₹75K for both regimes FY 2025-26
    let taxableIncome = Math.max(0, grossSalary - stdDeduction);

    if (regime === 'old') {
      // Employee EPF counts toward 80C automatically; cap total 80C at ₹1.5L
      const total80C = Math.min(employeeEpf + extra80C, 150000);
      taxableIncome = Math.max(0, taxableIncome - total80C);
    }

    const incomeTax = calcIncomeTax(taxableIncome, regime);

    // Net in-hand
    const annualInHand = Math.round(grossSalary - employeeEpf - professionalTax - incomeTax);
    const monthlyInHand = Math.round(annualInHand / 12);

    // Effective tax rate on CTC
    const effectiveTaxRate = ctc > 0 ? ((incomeTax / ctc) * 100).toFixed(1) : '0';

    return {
      basic: Math.round(basic),
      employerEpf: Math.round(employerEpf),
      employeeEpf: Math.round(employeeEpf),
      gratuity: Math.round(gratuity),
      grossSalary: Math.round(grossSalary),
      professionalTax,
      incomeTax,
      taxableIncome: Math.round(taxableIncome),
      annualInHand,
      monthlyInHand,
      effectiveTaxRate,
    };
  }, [ctc, basicPct, regime, extra80C]);

  const inputs = (
    <div className="space-y-8">
      {/* Tax Regime Toggle */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">
          Tax Regime <span className="text-[var(--color-ink-tertiary)] font-normal">(FY 2025-26)</span>
        </p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] font-[family-name:var(--font-ui)]">
          {(['new', 'old'] as TaxRegime[]).map(r => (
            <button
              key={r}
              onClick={() => setRegime(r)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                regime === r
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              {r === 'new' ? 'New Regime' : 'Old Regime'}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-2">
          {regime === 'new'
            ? 'No tax up to ₹12L (after ₹75K std. deduction). No 80C/HRA deductions.'
            : 'No tax up to ₹5L. Allows 80C (₹1.5L), 80D, HRA etc.'}
        </p>
      </div>

      <SliderInput
        label="Annual CTC"
        value={ctc}
        min={300000}
        max={10000000}
        step={100000}
        prefix="₹"
        onChange={setCtc}
      />
      <SliderInput
        label="Basic Salary"
        value={basicPct}
        min={30}
        max={60}
        step={5}
        suffix="% of CTC"
        onChange={setBasicPct}
        hint="Affects EPF & gratuity"
      />

      {regime === 'old' && (
        <div className="pt-2 border-t border-[var(--color-border)]">
          <SliderInput
            label="Additional 80C Investments"
            value={extra80C}
            min={0}
            max={150000}
            step={10000}
            prefix="₹"
            onChange={setExtra80C}
            hint="ELSS, PPF, LIC etc."
          />
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-2">
            Employee EPF (₹{formatIndianNumber(result.employeeEpf)}) is added automatically. Total 80C capped at ₹1.5L.
          </p>
        </div>
      )}
    </div>
  );

  // Breakdown rows for the itemized table
  const breakdownRows = [
    { label: 'Annual CTC', value: ctc, type: 'header' },
    { label: '− Employer EPF (12% of Basic)', value: result.employerEpf, type: 'deduction' },
    { label: '− Gratuity Provision (4.81%)', value: result.gratuity, type: 'deduction' },
    { label: 'Gross Salary', value: result.grossSalary, type: 'subtotal' },
    { label: '− Employee EPF (12% of Basic)', value: result.employeeEpf, type: 'deduction' },
    { label: '− Professional Tax', value: result.professionalTax, type: 'deduction' },
    { label: '− Income Tax', value: result.incomeTax, type: 'deduction' },
    { label: 'Annual In-Hand', value: result.annualInHand, type: 'result' },
  ];

  const CHART_COLORS = [
    'var(--color-cat-career)',
    'var(--color-accent-warm)',
    '#94a3b8',
    '#64748b',
    '#e2e8f0',
    '#cbd5e1',
  ];

  const chartData = [
    { name: 'In-Hand', value: result.annualInHand },
    { name: 'Income Tax', value: result.incomeTax },
    { name: 'Employee EPF', value: result.employeeEpf },
    { name: 'Prof. Tax', value: result.professionalTax },
    { name: 'Employer EPF', value: result.employerEpf },
    { name: 'Gratuity', value: result.gratuity },
  ];

  const results = (
    <div className="space-y-5 calc-result font-[family-name:var(--font-ui)]">
      {/* Hero */}
      <div className="text-center pb-5 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 uppercase tracking-widest">Monthly In-Hand</p>
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-career)]">
          ₹{formatIndianNumber(result.monthlyInHand)}
        </p>
        <p className="text-sm text-[var(--color-ink-tertiary)] mt-2">
          Annual: ₹{formatIndianNumber(result.annualInHand)}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Income Tax', value: `₹${formatIndianNumber(result.incomeTax)}`, sub: `${result.effectiveTaxRate}% eff.`, warn: result.incomeTax > 0 },
          { label: 'Employee EPF', value: `₹${formatIndianNumber(result.employeeEpf)}`, sub: 'Your contribution' },
          { label: 'Taxable Income', value: `₹${formatIndianNumber(result.taxableIncome)}`, sub: `After deductions` },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-ink-tertiary)] mb-1 leading-tight">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.warn ? 'text-red-500' : 'text-[var(--color-ink)]'}`}>{stat.value}</p>
            <p className="text-xs text-[var(--color-ink-tertiary)] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdown table */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] mb-2">Full Breakdown</p>
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          {breakdownRows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                'flex justify-between items-center px-4 py-2.5 text-sm',
                i < breakdownRows.length - 1 ? 'border-b border-[var(--color-border)]' : '',
                row.type === 'header' ? 'bg-[var(--color-surface-alt)]' : '',
                row.type === 'subtotal' ? 'bg-[var(--color-surface-alt)] font-semibold' : '',
                row.type === 'result' ? 'bg-[var(--color-cat-career-light)]' : 'bg-[var(--color-surface)]',
              )}
            >
              <span className={cn(
                'text-[var(--color-ink-secondary)]',
                row.type === 'result' || row.type === 'subtotal' ? 'font-semibold text-[var(--color-ink)]' : '',
              )}>
                {row.label}
              </span>
              <span className={cn(
                'font-semibold tabular-nums',
                row.type === 'deduction' ? 'text-red-500' : '',
                row.type === 'result' ? 'text-[var(--color-cat-career)]' : 'text-[var(--color-ink)]',
              )}>
                {row.type === 'deduction' ? '−' : ''}₹{formatIndianNumber(Math.abs(row.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Where Your CTC Goes</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={60} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
            <Tooltip formatter={rupeesFormatter} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const callout = `Assumes Basic = ${basicPct}% of CTC, Employer EPF = 12% of Basic, Gratuity = 4.81% of Basic, PT = ₹2,400/yr. Does not account for HRA exemption, NPS deduction (80CCD), or company-specific perks. Use as an estimate — your actual payslip may differ.`;

  return (
    <CalculatorLayout
      title="Take-Home Salary Calculator"
      description="Calculate your monthly in-hand salary from CTC — including EPF, gratuity, professional tax, and income tax under the new or old tax regime (FY 2025-26)."
      icon={<Briefcase size={30} />}
      theme="career"
      results={results}
      chart={chart}
      callout={callout}
    >
      {inputs}
    </CalculatorLayout>
  );
}
