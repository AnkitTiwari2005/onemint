'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function SwpPage() {

      const [corpus, setCorpus] = useState(5000000);
      const [withdrawal, setWithdrawal] = useState(30000);
      const [returnRate, setReturnRate] = useState(8);
      const [years, setYears] = useState(10);
      
      let currentCorpus = corpus; let totalWithdrawn = 0; const monthlyRate = returnRate / 12 / 100;
      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          currentCorpus = currentCorpus * (1 + monthlyRate) - withdrawal;
          totalWithdrawn += withdrawal;
        }
      }
      const finalCorpus = Math.max(0, currentCorpus);
      const chartDataObj = [{ name: 'Remaining Corpus', value: finalCorpus }, { name: 'Total Withdrawn', value: totalWithdrawn }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Total Corpus" value={corpus} min={500000} max={50000000} step={100000} prefix="₹" onChange={setCorpus} />
          <SliderInput label="Monthly Withdrawal" value={withdrawal} min={5000} max={500000} step={1000} prefix="₹" onChange={setWithdrawal} />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={setReturnRate} />
          <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Total Withdrawn</p><p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalWithdrawn))}</p></div>
          <div className="pt-4 border-t border-[var(--color-border)]"><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Final Corpus Balance</p>
          <p className={"text-3xl font-bold " + (finalCorpus === 0 ? "text-red-500" : "text-[var(--color-accent)]")}>₹{formatIndianNumber(Math.round(finalCorpus))}</p></div>
        </div>
      );
    

  const IconComponent = ArrowDownUp;
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
      title="SWP Calculator"
      description="Systematic Withdrawal Plan calculator to see how long your corpus will last."
      icon={<IconComponent size={32} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
