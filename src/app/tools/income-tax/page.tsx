'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IndianRupee, Info, ArrowLeft, ScrollText, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';

type Regime = 'old' | 'new';

interface Slab {
  from: number;
  to: number;
  rate: number;
}

const OLD_SLABS: Slab[] = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 5 },
  { from: 500000, to: 1000000, rate: 20 },
  { from: 1000000, to: Infinity, rate: 30 },
];

const NEW_SLABS: Slab[] = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300000, to: 700000, rate: 5 },
  { from: 700000, to: 1000000, rate: 10 },
  { from: 1000000, to: 1200000, rate: 15 },
  { from: 1200000, to: 1500000, rate: 20 },
  { from: 1500000, to: Infinity, rate: 30 },
];

function calculateTax(income: number, slabs: Slab[]): { tax: number; breakdown: { range: string; taxable: number; rate: number; tax: number }[] } {
  let remaining = income;
  let totalTax = 0;
  const breakdown: { range: string; taxable: number; rate: number; tax: number }[] = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const width = slab.to === Infinity ? remaining : Math.min(remaining, slab.to - slab.from);
    const taxOnSlab = width * (slab.rate / 100);
    totalTax += taxOnSlab;
    if (width > 0) {
      breakdown.push({
        range: slab.to === Infinity
          ? `Above ₹${formatIndianNumber(slab.from)}`
          : `₹${formatIndianNumber(slab.from)} – ₹${formatIndianNumber(slab.to)}`,
        taxable: Math.round(width),
        rate: slab.rate,
        tax: Math.round(taxOnSlab),
      });
    }
    remaining -= width;
  }

  return { tax: Math.round(totalTax), breakdown };
}

export default function IncomeTaxPage() {
  const [income, setIncome] = useState(1200000);
  const [regime, setRegime] = useState<Regime>('new');
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hra, setHra] = useState(0);
  const [nps80CCD, setNps80CCD] = useState(50000);

  const results = useMemo(() => {
    const standardDeduction = 75000; // FY 2024-25 new regime
    let taxableOld = income;
    let taxableNew = income;

    // Old regime deductions
    const totalOldDeductions = deductions80C + deductions80D + hra + nps80CCD + 50000; // 50k std deduction old
    taxableOld = Math.max(0, income - totalOldDeductions);

    // New regime: only standard deduction + NPS
    taxableNew = Math.max(0, income - standardDeduction - nps80CCD);

    const oldResult = calculateTax(taxableOld, OLD_SLABS);
    const newResult = calculateTax(taxableNew, NEW_SLABS);

    // Cess 4%
    const oldTaxWithCess = Math.round(oldResult.tax * 1.04);
    const newTaxWithCess = Math.round(newResult.tax * 1.04);

    // New regime rebate u/s 87A — no tax if taxable income <= 7L
    const newTaxFinal = taxableNew <= 700000 ? 0 : newTaxWithCess;
    const oldTaxFinal = taxableOld <= 500000 ? 0 : oldTaxWithCess;

    return {
      old: {
        taxableIncome: taxableOld,
        tax: oldTaxFinal,
        cess: oldTaxFinal > 0 ? Math.round(oldResult.tax * 0.04) : 0,
        effectiveRate: income > 0 ? ((oldTaxFinal / income) * 100).toFixed(1) : '0',
        breakdown: oldResult.breakdown,
        deductions: totalOldDeductions,
      },
      new: {
        taxableIncome: taxableNew,
        tax: newTaxFinal,
        cess: newTaxFinal > 0 ? Math.round(newResult.tax * 0.04) : 0,
        effectiveRate: income > 0 ? ((newTaxFinal / income) * 100).toFixed(1) : '0',
        breakdown: newResult.breakdown,
        deductions: standardDeduction + nps80CCD,
      },
      savings: oldTaxFinal - newTaxFinal,
      recommended: newTaxFinal <= oldTaxFinal ? 'new' : 'old',
    };
  }, [income, deductions80C, deductions80D, hra, nps80CCD]);

  const current = regime === 'old' ? results.old : results.new;

  const comparisonChart = [
    { name: 'Old Regime', tax: results.old.tax, fill: '#E11D48' },
    { name: 'New Regime', tax: results.new.tax, fill: '#059669' },
  ];

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 bg-[var(--color-surface-alt)] min-h-screen">
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6 font-[family-name:var(--font-ui)]">
          <ArrowLeft size={16} /> Back to Tools
        </Link>

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4 flex items-center gap-3">
            <IndianRupee className="text-[var(--color-cat-finance)]" size={40} />
            Income Tax Calculator
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl font-[family-name:var(--font-body)]">
            Compare old vs new tax regime for FY 2024-25. See which saves you more and plan your deductions smartly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Regime Toggle */}
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-6 border border-[var(--color-border)]">
              <label className="block font-semibold text-[var(--color-ink)] mb-3 font-[family-name:var(--font-ui)]">Tax Regime</label>
              <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
                {(['old', 'new'] as Regime[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegime(r)}
                    className={`flex-1 py-3 text-sm font-semibold transition-all font-[family-name:var(--font-ui)] ${
                      regime === r
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)]'
                    }`}
                  >
                    {r === 'old' ? <><ScrollText size={14} /> Old Regime</> : <><Sparkles size={14} /> New Regime</>}
                  </button>
                ))}
              </div>
              {results.recommended && (
                <p className="text-xs text-green-600 mt-3 font-semibold font-[family-name:var(--font-ui)] flex items-center gap-1">
                  <Lightbulb size={12} /> {results.recommended === 'new' ? 'New' : 'Old'} regime saves you ₹{formatIndianNumber(Math.abs(results.savings))} more
                </p>
              )}
            </div>

            {/* Income */}
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Annual Income (CTC)</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  ₹ {formatIndianNumber(income)}
                </div>
              </div>
              <input type="range" min="300000" max="10000000" step="50000"
                value={income} onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-cat-finance)]" />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-mono)]">
                <span>₹3L</span><span>₹1Cr</span>
              </div>
            </div>

            {/* Deductions (Old Regime only) */}
            {regime === 'old' && (
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-6 border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-ink)] mb-5 font-[family-name:var(--font-heading)]">Deductions (Old Regime)</h3>

                {/* 80C */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">Section 80C (PPF, ELSS, etc.)</label>
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold">₹{formatIndianNumber(deductions80C)}</span>
                  </div>
                  <input type="range" min="0" max="150000" step="10000"
                    value={deductions80C} onChange={(e) => setDeductions80C(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                </div>

                {/* 80D */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">Section 80D (Health Insurance)</label>
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold">₹{formatIndianNumber(deductions80D)}</span>
                  </div>
                  <input type="range" min="0" max="100000" step="5000"
                    value={deductions80D} onChange={(e) => setDeductions80D(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                </div>

                {/* HRA */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">HRA Exemption</label>
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold">₹{formatIndianNumber(hra)}</span>
                  </div>
                  <input type="range" min="0" max="500000" step="10000"
                    value={hra} onChange={(e) => setHra(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                </div>

                {/* NPS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">NPS (80CCD 1B)</label>
                    <span className="font-[family-name:var(--font-mono)] text-sm font-semibold">₹{formatIndianNumber(nps80CCD)}</span>
                  </div>
                  <input type="range" min="0" max="50000" step="5000"
                    value={nps80CCD} onChange={(e) => setNps80CCD(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]" />
                </div>
              </div>
            )}

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 border border-blue-100 font-[family-name:var(--font-body)]">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>This calculator uses FY 2024-25 slabs. Under new regime, income up to ₹7L is tax-free (Section 87A rebate). Standard deduction of ₹75,000 applies.</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Result */}
            <div className={`rounded-2xl p-6 lg:p-8 text-center text-white shadow-lg ${regime === 'new' ? 'bg-gradient-to-br from-emerald-600 to-teal-600' : 'bg-gradient-to-br from-rose-600 to-pink-600'}`}>
              <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">{regime === 'new' ? 'New' : 'Old'} Regime — Total Tax</p>
              <p className="font-[family-name:var(--font-mono)] text-4xl lg:text-6xl font-bold">
                ₹ {formatIndianNumber(current.tax)}
              </p>
              <p className="text-sm opacity-80 mt-2 font-[family-name:var(--font-mono)]">
                Effective Rate: {current.effectiveRate}% · includes 4% cess
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Gross Income</p>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--color-ink)]">₹{formatIndianNumber(income)}</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Deductions</p>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-green-600">−₹{formatIndianNumber(current.deductions)}</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Taxable Income</p>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--color-ink)]">₹{formatIndianNumber(current.taxableIncome)}</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">In-Hand (Monthly)</p>
                <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[var(--color-accent)]">₹{formatIndianNumber(Math.round((income - current.tax) / 12))}</p>
              </div>
            </div>

            {/* Slab Breakdown Table */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)] mb-4 font-[family-name:var(--font-heading)]">Slab-wise Breakdown</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border)]">
                    <th className="text-left py-2 px-2 text-[11px] uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Range</th>
                    <th className="text-right py-2 px-2 text-[11px] uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Rate</th>
                    <th className="text-right py-2 px-2 text-[11px] uppercase tracking-wider text-[var(--color-ink-tertiary)] font-[family-name:var(--font-ui)]">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {current.breakdown.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)]">
                      <td className="py-2.5 px-2 text-[var(--color-ink)] font-[family-name:var(--font-ui)]">{row.range}</td>
                      <td className="py-2.5 px-2 text-right font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">{row.rate}%</td>
                      <td className="py-2.5 px-2 text-right font-[family-name:var(--font-mono)] font-semibold text-[var(--color-ink)]">₹{formatIndianNumber(row.tax)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-3 px-2 text-[var(--color-ink)]">Total + 4% Cess</td>
                    <td></td>
                    <td className="py-3 px-2 text-right font-[family-name:var(--font-mono)] text-[var(--color-accent-warm)]">₹{formatIndianNumber(current.tax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Regime Comparison Chart */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)] mb-4 font-[family-name:var(--font-heading)]">Old vs New Regime Comparison</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChart} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--color-ink)', fontSize: 13, fontWeight: 600 }} width={110} />
                    <Tooltip formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, 'Tax']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }} />
                    <Bar dataKey="tax" radius={[0, 8, 8, 0]} barSize={40}>
                      {comparisonChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm font-semibold mt-4 font-[family-name:var(--font-ui)]">
                {results.savings > 0 ? (
                  <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle2 size={16} /> New Regime saves you ₹{formatIndianNumber(results.savings)}</span>
                ) : results.savings < 0 ? (
                  <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle2 size={16} /> Old Regime saves you ₹{formatIndianNumber(Math.abs(results.savings))}</span>
                ) : (
                  <span className="text-[var(--color-ink-secondary)]">Both regimes result in the same tax</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <article className="mt-16 bg-[var(--color-surface)] rounded-2xl p-8 lg:p-12 border border-[var(--color-border)] shadow-sm max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold mb-6 text-[var(--color-ink)]">Income Tax in India: Old vs New Regime Explained</h2>
          <div className="article-body">
            <p>India offers two tax regimes. The <strong>Old Regime</strong> has higher tax rates but allows deductions under Sections 80C, 80D, HRA, and more. The <strong>New Regime</strong> (default from FY 2023-24) has lower slab rates but almost no deductions.</p>
            <h3>Which Regime Should You Choose?</h3>
            <p>If your total deductions exceed ₹3-4 lakhs, the old regime might still save you more. For salaried individuals with limited deductions, the new regime is almost always better.</p>
            <h3>Key Changes for FY 2024-25</h3>
            <ul>
              <li>Standard deduction increased to ₹75,000 (new regime)</li>
              <li>New regime is the default — you must opt out for old regime</li>
              <li>Section 87A rebate: No tax up to ₹7L taxable income (new regime)</li>
              <li>NPS deduction (80CCD 1B) of ₹50,000 available in both regimes</li>
            </ul>
          </div>
        </article>

      </div>
    </div>
  );
}
