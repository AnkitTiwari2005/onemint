'use client';
import { useState } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowDownUp, Calculator, Building, Activity, Car, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

const COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

export default function BmiPage() {

      const [weight, setWeight] = useState(70);
      const [height, setHeight] = useState(170); // cm
      
      const heightInMeters = height / 100; const bmi = weight / (heightInMeters * heightInMeters);
      let category = ''; let color = '';
      if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-500'; } else if (bmi < 25) { category = 'Normal Weight'; color = 'text-green-500'; } else if (bmi < 30) { category = 'Overweight'; color = 'text-yellow-500'; } else { category = 'Obese'; color = 'text-red-500'; }
      const chartDataObj: any[] = [];
      
      const inputs = (
        <div className="space-y-6">
          <SliderInput label="Weight" value={weight} min={30} max={150} step={1} suffix=" kg" onChange={setWeight} />
          <SliderInput label="Height" value={height} min={120} max={220} step={1} suffix=" cm" onChange={setHeight} />
        </div>
      );
      const results = (
        <div className="space-y-6 text-center pt-8">
          <div><p className="text-sm text-[var(--color-ink-secondary)] mb-2">Your BMI</p><p className="text-6xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-4">{bmi.toFixed(1)}</p><p className={"text-xl font-bold " + color}>{category}</p></div>
        </div>
      );
    

  const IconComponent = Activity;
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
      title="BMI Calculator"
      description="Calculate your Body Mass Index and see your health classification."
      icon={<IconComponent size={32} />}
      theme="health"
      results={results}
      chart={chart}
    >
      {inputs}
    </CalculatorLayout>
  );
}
