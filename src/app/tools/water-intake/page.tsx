'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/cn';

type ActivityLevel = 'sedentary' | 'active' | 'very-active';
type Climate = 'normal' | 'hot';

const activityExtra: Record<ActivityLevel, number> = { sedentary: 0, active: 500, 'very-active': 1000 };
const climateExtra: Record<Climate, number> = { normal: 0, hot: 500 };

export default function WaterIntakePage() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState<ActivityLevel>('sedentary');
  const [climate, setClimate] = useState<Climate>('normal');

  const result = useMemo(() => {
    const base = weight * 35; // ml
    const total = base + activityExtra[activity] + climateExtra[climate];
    const litres = (total / 1000).toFixed(1);
    const glasses = Math.ceil(total / 250);
    const bottles = (total / 1000 / 1).toFixed(1);

    // Hydration schedule: 7am to 10pm = 15 hours = every hour roughly
    const wakeHour = 7;
    const sleepHour = 22;
    const hoursAwake = sleepHour - wakeHour;
    const mlPerHour = Math.round(total / hoursAwake);
    const schedule = Array.from({ length: 5 }, (_, i) => {
      const hour = wakeHour + Math.round((i / 4) * hoursAwake);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${h}:00 ${ampm} — ${mlPerHour} ml`;
    });

    return { total, litres, glasses, bottles, mlPerHour, schedule };
  }, [weight, activity, climate]);

  // Fill percentage for the animated glass
  const fillPct = Math.min(100, Math.max(5, (parseFloat(result.litres) / 5) * 100));

  const inputs = (
    <div className="space-y-8">
      {/* Weight slider using native range since SliderInput needs import fix */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">Weight</label>
          <span className="text-sm font-bold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">{weight} kg</span>
        </div>
        <input
          type="range" min={30} max={150} step={1} value={weight}
          onChange={e => setWeight(Number(e.target.value))}
          className="w-full"
          style={{ background: `linear-gradient(to right, var(--color-accent) ${((weight - 30) / 120) * 100}%, var(--color-surface-alt) ${((weight - 30) / 120) * 100}%)` }}
        />
        <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">
          <span>30 kg</span><span>150 kg</span>
        </div>
      </div>

      {/* Activity */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Activity Level</p>
        <div className="space-y-2">
          {([['sedentary', 'Sedentary (desk job)'], ['active', 'Active (workouts 3-5x/week)'], ['very-active', 'Very Active (daily intense)']] as [ActivityLevel, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setActivity(val)}
              className={cn('w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors font-[family-name:var(--font-ui)]',
                activity === val ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Climate */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)] mb-3">Climate</p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {([['normal', '🌤 Normal'], ['hot', '☀️ Hot/Humid']] as [Climate, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setClimate(val)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors font-[family-name:var(--font-ui)] ${climate === val ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const results = (
    <div className="space-y-5 calc-result">
      {/* Animated water glass */}
      <div className="flex justify-center mb-2">
        <div className="relative w-20 h-32 border-2 border-[var(--color-cat-technology)] rounded-b-xl overflow-hidden bg-[var(--color-surface)]">
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--color-cat-technology)] opacity-70 transition-all duration-700"
            style={{ height: `${fillPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-[var(--color-ink)] z-10 drop-shadow">{result.litres}L</span>
          </div>
        </div>
      </div>

      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-1">Daily Water Intake</p>
        <p className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-technology)]">{result.litres} L</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-2xl font-bold text-[var(--color-cat-technology)] font-[family-name:var(--font-display)]">{result.glasses}</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-0.5">250ml glasses</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-2xl font-bold text-[var(--color-cat-technology)] font-[family-name:var(--font-display)]">{result.bottles}</p>
          <p className="text-xs text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mt-0.5">1L bottles</p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)] mb-3">Hydration Schedule</p>
        <div className="space-y-1.5">
          {result.schedule.map(s => (
            <p key={s} className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">• {s}</p>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Water Intake Calculator"
      description="Find out exactly how much water your body needs every day based on your weight, activity level, and climate. Includes a hourly hydration schedule."
      icon={<Droplets size={30} />}
      theme="health"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
