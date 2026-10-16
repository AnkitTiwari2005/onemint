'use client';
import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { Activity } from 'lucide-react';

const RANGES = [
  { label: 'Underweight', max: 18.5, color: '#3B82F6' },
  { label: 'Normal', max: 25, color: '#16A34A' },
  { label: 'Overweight', max: 30, color: '#D97706' },
  { label: 'Obese', max: 40, color: '#DC2626' },
];

export default function BmiPage() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170); // cm

  const { bmi, category, color } = useMemo(() => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let category = '';
    let color = '';
    if (bmi < 18.5) { category = 'Underweight'; color = '#3B82F6'; }
    else if (bmi < 25) { category = 'Normal Weight'; color = '#16A34A'; }
    else if (bmi < 30) { category = 'Overweight'; color = '#D97706'; }
    else { category = 'Obese'; color = '#DC2626'; }
    return { bmi, category, color };
  }, [weight, height]);

  const inputs = (
    <div className="space-y-6">
      <SliderInput label="Weight" value={weight} min={30} max={150} step={1} suffix=" kg" onChange={setWeight} />
      <SliderInput label="Height" value={height} min={120} max={220} step={1} suffix=" cm" onChange={setHeight} />
    </div>
  );

  // BMI scale: clamp 10–40 range for display
  const scalePct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));

  const results = (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-sm text-[var(--color-ink-secondary)] mb-2">Your BMI</p>
        <p className="text-6xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-2">{bmi.toFixed(1)}</p>
        <p className="text-xl font-bold" style={{ color }}>{category}</p>
      </div>

      {/* BMI Scale bar */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-3">BMI Scale</p>
        <div className="relative h-4 rounded-full overflow-hidden flex">
          {RANGES.map((r, i) => {
            const prev = i === 0 ? 10 : RANGES[i - 1].max;
            const width = ((Math.min(r.max, 40) - prev) / 30) * 100;
            return <div key={r.label} style={{ width: `${width}%`, background: r.color }} />;
          })}
        </div>
        {/* Needle */}
        <div className="relative h-2 mt-1">
          <div
            className="absolute w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-[var(--color-ink)] -top-1"
            style={{ left: `calc(${scalePct}% - 6px)`, transition: 'left 0.3s ease' }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-2">
          {RANGES.map(r => <span key={r.label} style={{ color: r.color }}>{r.label}</span>)}
        </div>
      </div>

      {/* Healthy range callout */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400 font-[family-name:var(--font-ui)]">
        Healthy BMI range: <strong>18.5 – 24.9</strong>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI) and see where you fall on the health classification scale."
      icon={<Activity size={32} />}
      theme="health"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
