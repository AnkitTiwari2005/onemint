'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function CarLoanPage() {

      const [loanAmount, setLoanAmount] = useState(800000);
      const [interestRate, setInterestRate] = useState(9);
      const [tenure, setTenure] = useState(5);
      
      const monthlyRate = interestRate / 12 / 100; const totalMonths = tenure * 12;
      const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = emi * totalMonths; const totalInterest = totalPayment - loanAmount;
      const chartDataObj = [{ name: 'Principal', value: loanAmount }, { name: 'Interest', value: totalInterest }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Loan Amount" value={loanAmount} min={100000} max={5000000} step={50000} prefix="₹" onChange={setLoanAmount} />
          <SliderInput label="Interest Rate" value={interestRate} min={5} max={20} step={0.1} suffix="%" onChange={setInterestRate} />
          <SliderInput label="Loan Tenure" value={tenure} min={1} max={7} step={1} suffix=" Yr" onChange={setTenure} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Monthly EMI</p><p className="text-4xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(emi))}</p></div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Principal Amount</p><p className="font-bold">₹{formatIndianNumber(Math.round(loanAmount))}</p></div>
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Total Interest</p><p className="font-bold text-red-500">₹{formatIndianNumber(Math.round(totalInterest))}</p></div>
          </div>
        </div>
      );
    

  const IconComponent = Car;
  const chart = chartDataObj && chartDataObj.length > 0 ? (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartDataObj} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {chartDataObj.map((entry, index) => (
              <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(val: any) => '₹' + formatIndianNumber(Math.round(val as number))} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ) : null;

  return (
    <CalculatorLayout
      title="Car Loan EMI Calculator"
      description="Calculate your monthly car loan EMI and see the interest breakdown."
      icon={<IconComponent size={32} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
