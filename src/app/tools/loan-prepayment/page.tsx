'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CreditCard } from 'lucide-react';

type PrepaymentMode = 'reduce-tenure' | 'reduce-emi';

export default function LoanPrepaymentPage() {
  const [loanAmount, setLoanAmount] = useState(3000000);
  const [interestRate, setInterestRate] = useState(9);
  const [remainingTenure, setRemainingTenure] = useState(15);
  const [prepaymentAmount, setPrepaymentAmount] = useState(500000);
  const [mode, setMode] = useState<PrepaymentMode>('reduce-tenure');

  const result = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = remainingTenure * 12;

    if (totalMonths === 0 || loanAmount === 0) {
      return { origEMI: 0, origInterest: 0, newEMI: 0, newInterest: 0, newTenureMonths: 0, interestSaved: 0, tenureSaved: 0 };
    }

    // Original EMI
    const origEMI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const origInterest = origEMI * totalMonths - loanAmount;

    // New loan principal after prepayment
    const newPrincipal = Math.max(0, loanAmount - prepaymentAmount);

    let newEMI = origEMI;
    let newInterest = 0;
    let newTenureMonths = 0;

    if (mode === 'reduce-tenure') {
      // Keep EMI same, reduce tenure
      newEMI = origEMI;
      if (newPrincipal <= 0) {
        newTenureMonths = 0;
        newInterest = 0;
      } else {
        // n = -ln(1 - P*r/EMI) / ln(1+r)
        const n = -Math.log(1 - (newPrincipal * monthlyRate) / newEMI) / Math.log(1 + monthlyRate);
        newTenureMonths = Math.ceil(n);
        newInterest = newEMI * newTenureMonths - newPrincipal;
      }
    } else {
      // Keep tenure same, reduce EMI
      newTenureMonths = totalMonths;
      if (newPrincipal <= 0) {
        newEMI = 0;
        newInterest = 0;
      } else {
        newEMI = (newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, newTenureMonths)) /
          (Math.pow(1 + monthlyRate, newTenureMonths) - 1);
        newInterest = newEMI * newTenureMonths - newPrincipal;
      }
    }

    const interestSaved = origInterest - newInterest;
    const tenureSaved = totalMonths - newTenureMonths;

    return {
      origEMI: Math.round(origEMI),
      origInterest: Math.round(origInterest),
      newEMI: Math.round(newEMI),
      newInterest: Math.round(Math.max(0, newInterest)),
      newTenureMonths,
      interestSaved: Math.round(interestSaved),
      tenureSaved,
    };
  }, [loanAmount, interestRate, remainingTenure, prepaymentAmount, mode]);

  const chartData = [
    {
      label: 'Original',
      Principal: loanAmount,
      Interest: result.origInterest,
    },
    {
      label: 'After Prepay',
      Principal: loanAmount - prepaymentAmount,
      Interest: result.newInterest,
    },
  ];

  const inputs = (
    <div className="space-y-8">
      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] font-[family-name:var(--font-ui)]">
        {(['reduce-tenure', 'reduce-emi'] as PrepaymentMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'}`}
          >
            {m === 'reduce-tenure' ? 'Reduce Tenure' : 'Reduce EMI'}
          </button>
        ))}
      </div>

      <SliderInput label="Outstanding Loan Amount" value={loanAmount} min={100000} max={20000000} step={100000} prefix="₹" onChange={setLoanAmount} />
      <SliderInput label="Interest Rate" value={interestRate} min={5} max={20} step={0.25} suffix="%" onChange={setInterestRate} />
      <SliderInput label="Remaining Tenure" value={remainingTenure} min={1} max={30} step={1} suffix=" Yr" onChange={setRemainingTenure} />
      <SliderInput label="Prepayment Amount" value={prepaymentAmount} min={10000} max={loanAmount} step={10000} prefix="₹" onChange={setPrepaymentAmount} />
    </div>
  );

  const tenureSavedYrs = Math.floor(result.tenureSaved / 12);
  const tenureSavedMths = result.tenureSaved % 12;

  const results = (
    <div className="space-y-4 calc-result">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Interest Saved</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-finance)]">
          ₹{formatIndianNumber(result.interestSaved)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {mode === 'reduce-tenure' ? (
          <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] col-span-2">
            <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Time Saved</p>
            <p className="font-bold text-[var(--color-cat-finance)] font-[family-name:var(--font-ui)]">
              {tenureSavedYrs > 0 && `${tenureSavedYrs} yr `}{tenureSavedMths > 0 && `${tenureSavedMths} mo`}
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Old EMI</p>
              <p className="font-bold text-[var(--color-ink-secondary)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.origEMI)}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">New EMI</p>
              <p className="font-bold text-[var(--color-cat-finance)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.newEMI)}</p>
            </div>
          </>
        )}
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Original Interest</p>
          <p className="font-bold text-[var(--color-accent-warm)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.origInterest)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">New Interest</p>
          <p className="font-bold text-[var(--color-cat-finance)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(result.newInterest)}</p>
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Original vs After Prepayment</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
            <Tooltip formatter={rupeesFormatter} />
            <Legend />
            <Bar dataKey="Principal" fill="var(--color-cat-finance)" stackId="a" />
            <Bar dataKey="Interest" fill="var(--color-accent-warm)" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Loan Prepayment Calculator"
      description="See how much interest and time you save by making a lump sum prepayment on your home loan. Choose between reducing your EMI or your loan tenure."
      icon={<CreditCard size={30} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
