'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Home } from 'lucide-react';

const HORIZON_YEARS = 10;

export default function RentVsBuyPage() {
  // Rent scenario
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [rentIncrease, setRentIncrease] = useState(8);
  const [investmentReturn, setInvestmentReturn] = useState(12);

  // Buy scenario
  const [propertyPrice, setPropertyPrice] = useState(7500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [loanRate, setLoanRate] = useState(9);
  const [loanTenure, setLoanTenure] = useState(20);
  const [propertyAppreciation, setPropertyAppreciation] = useState(6);
  const [maintenancePct, setMaintenancePct] = useState(1);

  const { chartData, rentNetWorth, buyNetWorth, summary } = useMemo(() => {
    const downPayment = propertyPrice * (downPaymentPct / 100);
    const loanAmount = propertyPrice - downPayment;
    const monthlyLoanRate = loanRate / 12 / 100;
    const totalMonths = loanTenure * 12;

    // Monthly EMI
    const emi = loanAmount > 0
      ? (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalMonths)) /
        (Math.pow(1 + monthlyLoanRate, totalMonths) - 1)
      : 0;

    const annualMaintenance = propertyPrice * (maintenancePct / 100);

    const data: { year: string; 'Rent & Invest': number; 'Buy (Net Worth)': number }[] = [];

    let rentInvestCorpus = downPayment; // invested instead of giving down payment
    let currentRent = monthlyRent;
    let propertyValue = propertyPrice;
    let loanBalance = loanAmount;

    for (let y = 1; y <= HORIZON_YEARS; y++) {
      // Rent scenario: invest down payment + monthly savings vs EMI
      const annualRent = currentRent * 12;
      const monthlySavings = Math.max(0, emi - currentRent) / 12; // extra savings if rent < EMI
      rentInvestCorpus = rentInvestCorpus * (1 + investmentReturn / 100) + annualRent * 0 + monthlySavings * 12;
      // Actually: invest downpayment at return rate; invest difference between EMI and rent monthly
      rentInvestCorpus = (rentInvestCorpus - monthlySavings * 12) * (1 + investmentReturn / 100) + monthlySavings * 12;

      // Buy scenario: property appreciates, loan reduces
      propertyValue = propertyValue * (1 + propertyAppreciation / 100);
      for (let m = 0; m < 12; m++) {
        if (loanBalance > 0) {
          const interestPaid = loanBalance * monthlyLoanRate;
          const principalPaid = Math.min(emi - interestPaid, loanBalance);
          loanBalance = Math.max(0, loanBalance - principalPaid);
        }
      }
      const buyNetWorthY = propertyValue - loanBalance - annualMaintenance * y;

      // Rent net worth: invested corpus − cumulative rent paid
      const totalRentPaid = Array.from({ length: y }, (_, i) => monthlyRent * Math.pow(1 + rentIncrease / 100, i) * 12)
        .reduce((a, b) => a + b, 0);
      const rentNetWorthY = rentInvestCorpus - totalRentPaid;

      currentRent = Math.round(currentRent * (1 + rentIncrease / 100));
      data.push({
        year: `Y${y}`,
        'Rent & Invest': Math.round(rentInvestCorpus),
        'Buy (Net Worth)': Math.round(buyNetWorthY),
      });
    }

    const last = data[data.length - 1];
    const rentFinal = last['Rent & Invest'];
    const buyFinal = last['Buy (Net Worth)'];
    const diff = buyFinal - rentFinal;

    return {
      chartData: data,
      rentNetWorth: rentFinal,
      buyNetWorth: buyFinal,
      emi: Math.round(emi),
      summary: { diff, buying: diff > 0 },
    };
  }, [monthlyRent, rentIncrease, investmentReturn, propertyPrice, downPaymentPct, loanRate, loanTenure, propertyAppreciation, maintenancePct]);

  const inputs = (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-cat-technology)] font-[family-name:var(--font-ui)] mb-4">Rent Scenario</p>
        <div className="space-y-6">
          <SliderInput label="Monthly Rent" value={monthlyRent} min={5000} max={200000} step={1000} prefix="₹" onChange={setMonthlyRent} />
          <SliderInput label="Annual Rent Increase" value={rentIncrease} min={0} max={20} step={1} suffix="%" onChange={setRentIncrease} />
          <SliderInput label="Investment Return Rate" value={investmentReturn} min={6} max={20} step={0.5} suffix="%" onChange={setInvestmentReturn} />
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-cat-finance)] font-[family-name:var(--font-ui)] mb-4">Buy Scenario</p>
        <div className="space-y-6">
          <SliderInput label="Property Price" value={propertyPrice} min={1000000} max={50000000} step={500000} prefix="₹" onChange={setPropertyPrice} />
          <SliderInput label="Down Payment" value={downPaymentPct} min={10} max={50} step={5} suffix="%" onChange={setDownPaymentPct} />
          <SliderInput label="Home Loan Rate" value={loanRate} min={6} max={15} step={0.25} suffix="%" onChange={setLoanRate} />
          <SliderInput label="Loan Tenure" value={loanTenure} min={5} max={30} step={1} suffix=" Yr" onChange={setLoanTenure} />
          <SliderInput label="Property Appreciation" value={propertyAppreciation} min={2} max={15} step={0.5} suffix="%" onChange={setPropertyAppreciation} />
          <SliderInput label="Annual Maintenance + Tax" value={maintenancePct} min={0.5} max={3} step={0.5} suffix="%" onChange={setMaintenancePct} />
        </div>
      </div>
    </div>
  );

  const winner = summary.buying ? 'BUYING' : 'RENTING';
  const absDiff = Math.abs(summary.diff);

  const results = (
    <div className="space-y-4 calc-result">
      <div className={`rounded-xl px-4 py-4 text-center ${summary.buying ? 'bg-[var(--color-cat-finance-light)]' : 'bg-[var(--color-cat-technology-light)]'}`}>
        <p className="text-xs font-semibold font-[family-name:var(--font-ui)] text-[var(--color-ink-secondary)] mb-1">After {HORIZON_YEARS} Years</p>
        <p className={`text-lg font-bold font-[family-name:var(--font-display)] ${summary.buying ? 'text-[var(--color-cat-finance)]' : 'text-[var(--color-cat-technology)]'}`}>
          {winner} is better by ₹{formatIndianNumber(absDiff)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Rent Net Worth</p>
          <p className="font-bold text-[var(--color-cat-technology)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(rentNetWorth)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Buy Net Worth</p>
          <p className="font-bold text-[var(--color-cat-finance)] text-sm font-[family-name:var(--font-ui)]">₹{formatIndianNumber(buyNetWorth)}</p>
        </div>
      </div>
    </div>
  );

  const chart = (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-4">Net Worth Comparison Over 10 Years</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
            <Tooltip formatter={rupeesFormatter} />
            <Legend />
            <Line type="monotone" dataKey="Rent & Invest" stroke="var(--color-cat-technology)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Buy (Net Worth)" stroke="var(--color-cat-finance)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Rent vs Buy Calculator"
      description="Compare whether renting and investing the difference beats buying a home over a 10-year horizon. Accounts for EMI, appreciation, maintenance, and investment returns."
      icon={<Home size={30} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
