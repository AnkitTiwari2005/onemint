'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function TakeHomeSalaryPage() {

      const [ctc, setCtc] = useState(1200000);
      const [epfDeduction, setEpfDeduction] = useState(12);
      
      const basic = ctc * 0.4; const epf = (basic * epfDeduction) / 100;
      const pt = 200 * 12; const inHand = ctc - (epf * 2) - pt;
      const monthlyInHand = inHand / 12;
      const chartDataObj = [{ name: 'In-Hand', value: inHand }, { name: 'Deductions', value: ctc - inHand }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Annual CTC" value={ctc} min={300000} max={5000000} step={100000} prefix="₹" onChange={setCtc} />
          <SliderInput label="EPF Contribution" value={epfDeduction} min={0} max={12} step={1} suffix="%" onChange={setEpfDeduction} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Monthly In-Hand</p><p className="text-4xl font-bold text-green-600">₹{formatIndianNumber(Math.round(monthlyInHand))}</p></div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Annual In-Hand</p><p className="font-bold">₹{formatIndianNumber(Math.round(inHand))}</p></div>
            <div><p className="text-xs text-[var(--color-ink-secondary)]">Annual Deductions</p><p className="font-bold text-red-500">₹{formatIndianNumber(Math.round(ctc - inHand))}</p></div>
          </div>
        </div>
      );
    

  const IconComponent = Briefcase;
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
      title="Take Home Salary Calculator"
      description="Calculate your in-hand salary after standard deductions, EPF, and taxes."
      icon={<IconComponent size={32} />}
      theme="career"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
