'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function MfReturnsPage() {

      const [initial, setInitial] = useState(100000);
      const [final, setFinal] = useState(250000);
      const [years, setYears] = useState(5);
      
      const isLoss = final < initial;
      const absoluteReturn = ((final - initial) / initial) * 100;
      const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
      // Clamp gains to 0 for chart — a negative-value slice breaks Recharts PieChart
      const chartDataObj = [{ name: 'Invested', value: initial }, { name: isLoss ? 'Loss' : 'Gains', value: Math.max(0, final - initial) }];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Initial Investment" value={initial} min={10000} max={10000000} step={10000} prefix="₹" onChange={setInitial} />
          <SliderInput label="Final Value" value={final} min={10000} max={50000000} step={10000} prefix="₹" onChange={setFinal} />
          <SliderInput label="Time Period" value={years} min={1} max={30} step={1} suffix=" Yr" onChange={setYears} />
        </div>
      );
      const returnColor = isLoss ? 'text-red-600' : 'text-green-600';
      const results = (
        <div className="space-y-6 text-center">
          {isLoss && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              Final value is less than initial investment — this represents a loss.
            </div>
          )}
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">Absolute Return</p><p className={`text-4xl font-bold ${returnColor}`}>{absoluteReturn.toFixed(1)}%</p></div>
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-1">CAGR</p><p className={`text-4xl font-bold ${isLoss ? 'text-red-600' : 'text-[var(--color-accent)]'}`}>{cagr.toFixed(1)}%</p></div>
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RechartsTooltip formatter={(val: any) => '₹' + formatIndianNumber(Math.round(Number(val)))} />
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
