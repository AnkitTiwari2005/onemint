'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { SliderInput } from '@/components/SliderInput';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job)',
  light: 'Lightly Active (1–3 days/wk)',
  moderate: 'Moderately Active (3–5 days/wk)',
  very: 'Very Active (6–7 days/wk)',
  extra: 'Extra Active (physical job + gym)',
};

interface GoalRow { label: string; calories: number; note: string; highlight?: boolean }

export default function CaloriesPage() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  const { bmr, tdee, goals } = useMemo(() => {
    // Mifflin-St Jeor equation
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * activityMultipliers[activity]);

    const goals: GoalRow[] = [
      { label: 'Lose Weight Fast', calories: tdee - 500, note: '~0.5 kg/week loss' },
      { label: 'Lose Weight', calories: tdee - 250, note: '~0.25 kg/week loss' },
      { label: 'Maintain Weight', calories: tdee, note: 'TDEE', highlight: true },
      { label: 'Gain Weight', calories: tdee + 300, note: '~0.3 kg/week gain' },
      { label: 'Gain Fast', calories: tdee + 500, note: '~0.5 kg/week gain' },
    ];

    return { bmr: Math.round(bmr), tdee, goals };
  }, [gender, age, weight, height, activity]);

  const inputs = (
    <div className="space-y-8">
      {/* Gender toggle */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Gender</p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)] font-[family-name:var(--font-ui)]">
          {(['male', 'female'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${gender === g ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'}`}
            >
              {g === 'male' ? '♂ Male' : '♀ Female'}
            </button>
          ))}
        </div>
      </div>

      <SliderInput label="Age" value={age} min={15} max={80} step={1} suffix=" yrs" onChange={setAge} />
      <SliderInput label="Weight" value={weight} min={30} max={200} step={1} suffix=" kg" onChange={setWeight} />
      <SliderInput label="Height" value={height} min={120} max={230} step={1} suffix=" cm" onChange={setHeight} />

      {/* Activity level selector */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Activity Level</p>
        <div className="space-y-2">
          {(Object.keys(activityLabels) as ActivityLevel[]).map(a => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-ui)] border transition-colors',
                activity === a
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'
              )}
            >
              {activityLabels[a]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const results = (
    <div className="space-y-4 calc-result">
      <div className="grid grid-cols-2 gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">BMR</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-ink)]">{bmr}</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">kcal/day at rest</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-cat-health-light)] border border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">TDEE</p>
          <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-health)]">{tdee}</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">kcal/day maintenance</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Goal-Based Calories</p>
      <div className="space-y-2">
        {goals.map(g => (
          <div
            key={g.label}
            className={cn(
              'flex items-center justify-between px-4 py-3 rounded-xl border font-[family-name:var(--font-ui)]',
              g.highlight
                ? 'border-[var(--color-cat-health)] bg-[var(--color-cat-health-light)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]'
            )}
          >
            <div>
              <p className={`text-sm font-semibold ${g.highlight ? 'text-[var(--color-cat-health)]' : 'text-[var(--color-ink)]'}`}>{g.label}</p>
              <p className="text-xs text-[var(--color-ink-tertiary)]">{g.note}</p>
            </div>
            <p className={`text-lg font-bold tabular-nums ${g.highlight ? 'text-[var(--color-cat-health)]' : 'text-[var(--color-ink)]'}`}>
              {g.calories} <span className="text-xs font-normal">kcal</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Calorie Calculator"
      description="Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation. Get goal-specific calorie targets."
      icon={<Flame size={30} />}
      theme="health"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
