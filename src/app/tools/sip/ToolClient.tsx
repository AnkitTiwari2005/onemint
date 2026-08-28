'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Info, ArrowLeft, AlertTriangle } from 'lucide-react';

// ── Scenario presets ──────────────────────────────────────────────────────────
const SCENARIOS = [
  { label: 'Conservative', rate: 8,  color: '#6b7280', desc: 'Debt funds, hybrid' },
  { label: 'Moderate',     rate: 12, color: '#2563eb', desc: 'Diversified equity' },
  { label: 'Aggressive',   rate: 15, color: '#16a34a', desc: 'Small/mid-cap funds' },
] as const;

const INFLATION_RATE = 6; // %, used for real-value calculation

function calcSIP(monthlyInvestment: number, returnRate: number, years: number) {
  let invested = 0;
  let value = 0;
  const monthlyRate = returnRate / 12 / 100;
  const months = years * 12;
  const data = [];

  for (let i = 1; i <= months; i++) {
    invested += monthlyInvestment;
    value = (value + monthlyInvestment) * (1 + monthlyRate);
    if (i % 12 === 0) {
      data.push({
        year: `Yr ${i / 12}`,
        invested: Math.round(invested),
        returns: Math.round(value - invested),
        total: Math.round(value),
      });
    }
  }
  data.unshift({ year: 'Start', invested: 0, returns: 0, total: 0 });

  // Inflation-adjusted real value
  const inflationFactor = Math.pow(1 + INFLATION_RATE / 100, years);
  const realValue = value / inflationFactor;

  return {
    totalInvested: invested,
    estimatedReturns: value - invested,
    totalValue: value,
    realValue,
    chartData: data,
  };
}

export default function SIPCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [returnRate, setReturnRate]               = useState(12);
  const [years, setYears]                         = useState(10);
  const [activeScenario, setActiveScenario]       = useState<number | null>(1); // 0=cons, 1=mod, 2=agg, null=custom
  const [showInflation, setShowInflation]         = useState(false);

  // When user moves the rate slider manually, deselect scenario tabs
  function handleRateChange(rate: number) {
    setReturnRate(rate);
    const matched = SCENARIOS.findIndex(s => s.rate === rate);
    setActiveScenario(matched === -1 ? null : matched);
  }

  function handleScenarioClick(idx: number) {
    setActiveScenario(idx);
    setReturnRate(SCENARIOS[idx].rate);
  }

  const { totalInvested, estimatedReturns, totalValue, realValue, chartData } = useMemo(
    () => calcSIP(monthlyInvestment, returnRate, years),
    [monthlyInvestment, returnRate, years],
  );

  // All 3 scenario values for the comparison table
  const scenarioResults = useMemo(
    () => SCENARIOS.map(s => calcSIP(monthlyInvestment, s.rate, years)),
    [monthlyInvestment, years],
  );

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 bg-[var(--color-surface-alt)] min-h-screen">
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Back Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Tools
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4 flex items-center gap-3">
            <Calculator className="text-[var(--color-cat-finance)]" size={40} />
            SIP Calculator
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl">
            Calculate the future value of your monthly mutual fund investments. Choose a scenario or set a custom return rate.
          </p>
        </div>

        {/* ── Scenario tabs ── */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {SCENARIOS.map((s, idx) => (
            <button
              key={s.label}
              onClick={() => handleScenarioClick(idx)}
              className={`flex flex-col items-start px-5 py-3 rounded-xl border-2 transition-all text-left ${
                activeScenario === idx
                  ? 'border-[var(--color-cat-finance)] bg-[var(--color-cat-finance-light)] shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-cat-finance)] opacity-70 hover:opacity-100'
              }`}
            >
              <span className="font-bold text-[var(--color-ink)] text-sm">{s.label}</span>
              <span className="text-xs text-[var(--color-ink-tertiary)]">{s.rate}% · {s.desc}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveScenario(null)}
            className={`flex flex-col items-start px-5 py-3 rounded-xl border-2 transition-all text-left ${
              activeScenario === null
                ? 'border-[var(--color-cat-finance)] bg-[var(--color-cat-finance-light)] shadow-sm'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-cat-finance)] opacity-70 hover:opacity-100'
            }`}
          >
            <span className="font-bold text-[var(--color-ink)] text-sm">Custom</span>
            <span className="text-xs text-[var(--color-ink-tertiary)]">Set your own rate</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-6 lg:p-8 border border-[var(--color-border)]">

            {/* Input: Monthly Investment */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)]">Monthly Investment</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  ₹ {formatIndianNumber(monthlyInvestment)}
                </div>
              </div>
              <input
                type="range"
                min="500" max="100000" step="500"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-cat-finance)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2">
                <span>₹500</span><span>₹1 Lakh</span>
              </div>
            </div>

            {/* Input: Expected Return */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)]">Expected Return Rate (p.a.)</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  {returnRate}%
                </div>
              </div>
              <input
                type="range"
                min="1" max="30" step="0.5"
                value={returnRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-cat-finance)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2">
                <span>1%</span><span>30%</span>
              </div>
            </div>

            {/* Input: Time Period */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)]">Time Period</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  {years} Yr
                </div>
              </div>
              <input
                type="range"
                min="1" max="40" step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-cat-finance)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2">
                <span>1 Yr</span><span>40 Yr</span>
              </div>
            </div>

            {/* Inflation toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${showInflation ? 'bg-[var(--color-cat-finance)]' : 'bg-gray-300'}`}
                onClick={() => setShowInflation(v => !v)}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showInflation ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-[var(--color-ink)]">Show inflation-adjusted value <span className="text-[var(--color-ink-tertiary)]">(@{INFLATION_RATE}%)</span></span>
            </label>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3 border border-blue-100 dark:border-blue-800/30">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>Nifty 50 has historically returned ~11–13% p.a. over 15+ year periods. Individual fund performance varies significantly.</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <p className="text-sm font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2">Total Invested</p>
                <p className="font-[family-name:var(--font-mono)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)]">
                  ₹ {formatIndianNumber(totalInvested)}
                </p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <p className="text-sm font-semibold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2">Est. Returns</p>
                <p className="font-[family-name:var(--font-mono)] text-2xl lg:text-3xl font-bold text-[var(--color-cat-finance)]">
                  ₹ {formatIndianNumber(Math.round(estimatedReturns))}
                </p>
              </div>
            </div>

            {/* Total Value Card */}
            <div className="bg-[var(--color-cat-finance-light)] rounded-2xl p-6 lg:p-8 text-center shadow-sm">
              <p className="text-sm font-bold text-[var(--color-cat-finance)] uppercase tracking-wider mb-3">Total Value at {returnRate}%</p>
              <p className="font-[family-name:var(--font-mono)] text-4xl lg:text-6xl font-bold text-[var(--color-cat-finance)]">
                {formatIndianCurrency(totalValue)}
              </p>
              <p className="text-[var(--color-cat-finance)] opacity-80 mt-2 font-[family-name:var(--font-mono)]">
                (₹ {formatIndianNumber(Math.round(totalValue))})
              </p>
              {showInflation && (
                <div className="mt-4 pt-4 border-t border-[var(--color-cat-finance)]/20">
                  <p className="text-xs text-[var(--color-cat-finance)] opacity-70 mb-1">Inflation-adjusted real value (in today&apos;s ₹, at {INFLATION_RATE}% inflation)</p>
                  <p className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[var(--color-cat-finance)] opacity-80">
                    {formatIndianCurrency(realValue)}
                  </p>
                </div>
              )}
            </div>

            {/* Scenario comparison table */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)] mb-4">How scenarios compare</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left pb-3 font-semibold text-[var(--color-ink-secondary)]">Scenario</th>
                      <th className="text-right pb-3 font-semibold text-[var(--color-ink-secondary)]">Rate</th>
                      <th className="text-right pb-3 font-semibold text-[var(--color-ink-secondary)]">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCENARIOS.map((s, idx) => (
                      <tr
                        key={s.label}
                        className={`border-b border-[var(--color-border)] last:border-0 cursor-pointer hover:bg-[var(--color-surface-alt)] transition-colors ${activeScenario === idx ? 'bg-[var(--color-cat-finance-light)]' : ''}`}
                        onClick={() => handleScenarioClick(idx)}
                      >
                        <td className="py-3 font-medium text-[var(--color-ink)]" style={{ color: s.color }}>{s.label}</td>
                        <td className="py-3 text-right font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">{s.rate}%</td>
                        <td className="py-3 text-right font-[family-name:var(--font-mono)] font-bold text-[var(--color-ink)]">
                          {formatIndianCurrency(scenarioResults[idx].totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-ink-tertiary)] mt-3">Click a row to apply that scenario to the calculator.</p>
            </div>

            {/* Chart */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm flex-1 min-h-[300px]">
              <h3 className="font-semibold text-[var(--color-ink)] mb-6">Wealth Growth Over Time</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-cat-finance)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-ink-tertiary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-ink-tertiary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }}
                      dy={10} minTickGap={30}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      dx={-10}
                    />
                    <Tooltip
                      formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                    />
                    <Area type="monotone" dataKey="total"    stroke="var(--color-cat-finance)"    strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
                    <Area type="monotone" dataKey="invested" stroke="var(--color-ink-tertiary)"   strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Important disclaimer ─────────────────────────────────────────── */}
        <div className="mt-10 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6 flex gap-4">
          <AlertTriangle className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
          <div className="text-sm text-amber-900 dark:text-amber-200 space-y-2">
            <p className="font-bold text-amber-800 dark:text-amber-300">Important: This is an estimate, not a guarantee</p>
            <ul className="space-y-1 list-disc list-inside text-amber-800 dark:text-amber-300/90">
              <li>Returns are assumed to be constant. Actual mutual fund returns vary year to year.</li>
              <li>Past market performance does not guarantee future results.</li>
              <li>Expense ratios (typically 0.5–2% p.a.) will reduce your actual returns — factor these in.</li>
              <li>Exit loads, capital gains tax (LTCG at 12.5% above ₹1.25 lakh), and inflation will further affect your real gains.</li>
              <li>This calculator is for educational purposes only. Consult a SEBI-registered investment advisor before making investment decisions.</li>
            </ul>
          </div>
        </div>

        {/* SEO Content / Guide */}
        <article className="mt-12 bg-[var(--color-surface)] rounded-2xl p-8 lg:p-12 border border-[var(--color-border)] shadow-sm max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold mb-6">How does a SIP Calculator work?</h2>
          <div className="article-body">
            <p>A SIP (Systematic Investment Plan) calculator helps you estimate the future value of your monthly mutual fund investments using compound interest. It is a planning tool — actual returns will differ based on fund selection, market conditions, and fees.</p>
            <h3>The Formula Behind SIP Returns</h3>
            <p>The mathematical formula used by SIP calculators is:</p>
            <p className="font-[family-name:var(--font-mono)] bg-[var(--color-surface-alt)] p-4 rounded-xl text-center">
              M = P × ({'{(1 + i)'}^n - 1) / i × (1 + i)
            </p>
            <p>Where:<br/>
              <strong>M</strong> = Maturity amount<br/>
              <strong>P</strong> = Regular monthly investment<br/>
              <strong>n</strong> = Number of payments (months)<br/>
              <strong>i</strong> = Periodic rate of interest (annual rate / 12)
            </p>
            <h3>Why scenarios matter</h3>
            <p>No one can predict market returns. Using three scenarios — conservative (8%), moderate (12%), and aggressive (15%) — gives you a realistic range. Plan for the conservative case; be pleasantly surprised if returns are higher. The inflation-adjusted view shows what your corpus will actually buy in today&apos;s money.</p>
            <h3>Why you should start a SIP early</h3>
            <p>Because of compounding, the time you stay invested matters far more than the amount. A ₹5,000 monthly SIP started at age 25 will typically outgrow a ₹15,000 SIP started at age 40 — even at the same return rate.</p>
          </div>
        </article>

      </div>
    </div>
  );
}
