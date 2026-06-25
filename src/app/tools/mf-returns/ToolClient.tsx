'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function MfReturnsPage() {

      const [initial, setInitial] = useState(100000);
      const [final, setFinal] = useState(250000);
      const [years, setYears] = useState(5);
      
      const absoluteReturn = ((final - initial) / initial) * 100;
      const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
      const chartDataObj = [{ name: 'Invested', value: initial }, { name: 'Gains', value: final - initial }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Initial Investment" value={initial} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInitial} />
          <SliderInput label="Final Value" value={final} min={10000} max={50000000} step={10000} prefix="₹" onChange={setFinal} />
          <SliderInput label="Time Period" value={years} min={1} max={30} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Absolute Return</p><p className="text-4xl font-bold text-green-600">{absoluteReturn.toFixed(1)}%</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">CAGR</p><p className="text-4xl font-bold text-[var(--color-accent)]">{cagr.toFixed(1)}%</p></div>
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
      title="Mutual Fund Returns Calculator"
      description="Calculate absolute and CAGR returns on your mutual fund investments."
      icon={<IconComponent size={32} />}
      theme="finance"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
