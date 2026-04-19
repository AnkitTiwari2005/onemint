'use client';

import { useState, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { formatIndianNumber } from '@/lib/utils';
import { HeartPulse, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';

type AgeBracket = 'under30' | '30to45' | '45to60' | 'above60';
type CityTier = 'metro' | 'tier2' | 'tier3';
type Members = 'self' | 'self-spouse' | 'family';
type SumInsured = 300000 | 500000 | 1000000 | 2000000 | 5000000;

// Base annual premiums (₹) for individual, ₹5L cover
const BASE_PREMIUMS: Record<AgeBracket, [number, number]> = {
  under30: [4000, 8000],
  '30to45': [8000, 18000],
  '45to60': [18000, 40000],
  above60: [40000, 80000],
};

const SUM_MULTIPLIERS: Record<SumInsured, number> = {
  300000: 0.65,
  500000: 1,
  1000000: 1.8,
  2000000: 3,
  5000000: 6,
};

function getAgeBracket(age: number): AgeBracket {
  if (age < 30) return 'under30';
  if (age < 45) return '30to45';
  if (age < 60) return '45to60';
  return 'above60';
}

export default function HealthInsurancePage() {
  const [age, setAge] = useState(32);
  const [cityTier, setCityTier] = useState<CityTier>('metro');
  const [members, setMembers] = useState<Members>('self');
  const [preExisting, setPreExisting] = useState(false);
  const [sumInsured, setSumInsured] = useState<SumInsured>(500000);

  const result = useMemo(() => {
    const bracket = getAgeBracket(age);
    const [baseMin, baseMax] = BASE_PREMIUMS[bracket];
    const sumMul = SUM_MULTIPLIERS[sumInsured];
    const membersMul = members === 'family' ? 1.5 : members === 'self-spouse' ? 1.25 : 1;
    const preMul = preExisting ? 1.3 : 1;
    const cityMul = cityTier === 'metro' ? 1.15 : cityTier === 'tier2' ? 1.0 : 0.9;

    const annualMin = Math.round(baseMin * sumMul * membersMul * preMul * cityMul);
    const annualMax = Math.round(baseMax * sumMul * membersMul * preMul * cityMul);
    const monthlyMin = Math.round(annualMin / 12);
    const monthlyMax = Math.round(annualMax / 12);

    // 80D deduction: premium paid up to ₹25K (<60), ₹50K (>=60)
    const taxLimit = age >= 60 ? 50000 : 25000;
    const deduction80D = Math.min(annualMin, taxLimit);

    return { annualMin, annualMax, monthlyMin, monthlyMax, deduction80D };
  }, [age, cityTier, members, preExisting, sumInsured]);

  const sumOptions: SumInsured[] = [300000, 500000, 1000000, 2000000, 5000000];
  const sumLabels: Record<SumInsured, string> = {
    300000: '₹3L', 500000: '₹5L', 1000000: '₹10L', 2000000: '₹20L', 5000000: '₹50L',
  };

  const inputs = (
    <div className="space-y-8 font-[family-name:var(--font-ui)]">
      {/* Age */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-[var(--color-ink-secondary)]">Age</label>
          <span className="text-sm font-bold text-[var(--color-ink)]">{age} yrs</span>
        </div>
        <input type="range" min={18} max={65} step={1} value={age} onChange={e => setAge(Number(e.target.value))} className="w-full"
          style={{ background: `linear-gradient(to right, var(--color-accent) ${((age - 18) / 47) * 100}%, var(--color-surface-alt) ${((age - 18) / 47) * 100}%)` }} />
        <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)]"><span>18 yrs</span><span>65 yrs</span></div>
      </div>

      {/* City Tier */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] mb-3">City Type</p>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {([['metro', 'Metro'], ['tier2', 'Tier 2'], ['tier3', 'Tier 3']] as [CityTier, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setCityTier(v)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${cityTier === v ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] mb-3">Members Covered</p>
        <div className="space-y-2">
          {([['self', 'Self only'], ['self-spouse', 'Self + Spouse'], ['family', 'Family Floater (2 adults + kids)']] as [Members, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setMembers(v)}
              className={cn('w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors',
                members === v ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Pre-existing */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-ink-secondary)]">Pre-existing conditions?</p>
        <button onClick={() => setPreExisting(p => !p)}
          className={cn('w-12 h-6 rounded-full transition-colors relative', preExisting ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]')}>
          <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all', preExisting ? 'left-7' : 'left-1')} />
        </button>
      </div>

      {/* Sum Insured */}
      <div>
        <p className="text-sm font-medium text-[var(--color-ink-secondary)] mb-3">Sum Insured</p>
        <div className="flex flex-wrap gap-2">
          {sumOptions.map(s => (
            <button key={s} onClick={() => setSumInsured(s)}
              className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                sumInsured === s ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]')}>
              {sumLabels[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const results = (
    <div className="space-y-4 calc-result font-[family-name:var(--font-ui)]">
      <div className="text-center pb-4 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Estimated Annual Premium</p>
        <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-cat-health)]">
          ₹{formatIndianNumber(result.annualMin)} – ₹{formatIndianNumber(result.annualMax)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">Monthly Cost</p>
          <p className="font-bold text-[var(--color-ink)] text-sm">₹{formatIndianNumber(result.monthlyMin)} – ₹{formatIndianNumber(result.monthlyMax)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-ink-tertiary)] mb-1">80D Tax Deduction</p>
          <p className="font-bold text-[var(--color-cat-finance)] text-sm">Up to ₹{formatIndianNumber(result.deduction80D)}</p>
        </div>
      </div>
      <a href="https://www.policybazaar.com/health-insurance/" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--color-accent)] text-[var(--color-accent)] font-semibold text-sm hover:bg-[var(--color-accent-light)] transition-colors">
        Compare plans on Policybazaar <ExternalLink size={14} />
      </a>
      <p className="text-xs text-[var(--color-ink-tertiary)] leading-relaxed">
        ⚠️ These are estimates only. Actual premiums vary significantly by insurer, your health history, and specific policy terms.
      </p>
    </div>
  );

  return (
    <CalculatorLayout
      title="Health Insurance Estimator"
      description="Get an estimated annual health insurance premium range based on your age, city, family size, and sum insured. Includes 80D tax benefit calculation."
      icon={<HeartPulse size={30} />}
      theme="health"
      results={results}
    >
      {inputs}
    </CalculatorLayout>
  );
}
