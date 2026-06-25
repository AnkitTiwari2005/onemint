'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function LumpsumPage() {

      const [investment, setInvestment] = useState(100000); const [returnRate, setReturnRate] = useState(12); const [years, setYears] = useState(10);
      const futureValue = investment * Math.pow(1 + returnRate / 100, years); const totalReturns = futureValue - investment;
      const chartDataObj = [{ name: 'Invested', value: investment }, { name: 'Returns', value: totalReturns }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Total Investment" value={investment} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInvestment} />
          <SliderInput label="Expected Return Rate" value={returnRate} min={1} max={30} step={0.5} suffix="%" onChange={setReturnRate} />
          <SliderInput label="Time Period" value={years} min={1} max={40} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Invested Amount</p><p className="text-xl font-bold">₹{formatIndianNumber(investment)}</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)]">Estimated Returns</p><p className="text-xl font-bold text-green-600">₹{formatIndianNumber(Math.round(totalReturns))}</p></div>
          <div className="pt-4 border-t border-[var(--color-border)]"><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Total Value</p><p className="text-3xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round(futureValue))}</p></div>
        </div>
      );
    

  const IconComponent = TrendingUp;
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
      title="Lumpsum Calculator"
      description="Calculate the future value of a one-time investment using the power of compounding."
      icon={<IconComponent size={32} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
