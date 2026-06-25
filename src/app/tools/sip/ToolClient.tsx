'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Info, ArrowLeft } from 'lucide-react';

export default function SIPCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(10);

  // Calculate values
  const { totalInvested, estimatedReturns, totalValue, chartData } = useMemo(() => {
    let invested = 0;
    let value = 0;
    const monthlyRate = returnRate / 12 / 100;
    const months = years * 12;
    const data = [];

    for (let i = 1; i <= months; i++) {
      invested += monthlyInvestment;
      value = (value + monthlyInvestment) * (1 + monthlyRate);
      
      // Save data points yearly
      if (i % 12 === 0) {
        data.push({
          year: `Year ${i / 12}`,
          invested: Math.round(invested),
          returns: Math.round(value - invested),
          total: Math.round(value),
        });
      }
    }

    // Add year 0
    data.unshift({ year: 'Start', invested: 0, returns: 0, total: 0 });

    return {
      totalInvested: invested,
      estimatedReturns: value - invested,
      totalValue: value,
      chartData: data,
    };
  }, [monthlyInvestment, returnRate, years]);

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
            Calculate the future value of your monthly mutual fund investments and see the power of compounding in action.
          </p>
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
                <span>₹500</span>
                <span>₹1 Lakh</span>
              </div>
            </div>

            {/* Input: Expected Return */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)]">Expected Return Rate (p.a)</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  {returnRate}%
                </div>
              </div>
              <input 
                type="range" 
                min="1" max="30" step="0.5" 
                value={returnRate} 
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-cat-finance)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2">
                <span>1%</span>
                <span>30%</span>
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
                <span>1 Yr</span>
                <span>40 Yr</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3 border border-blue-100 dark:border-blue-800/30">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>Historical returns of Indian equities (Nifty 50) average around 12-14% over the long term. Mutual fund investments are subject to market risks.</p>
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
              <p className="text-sm font-bold text-[var(--color-cat-finance)] uppercase tracking-wider mb-3">Total Value</p>
              <p className="font-[family-name:var(--font-mono)] text-4xl lg:text-6xl font-bold text-[var(--color-cat-finance)]">
                {formatIndianCurrency(totalValue)}
              </p>
              <p className="text-[var(--color-cat-finance)] opacity-80 mt-2 font-[family-name:var(--font-mono)]">
                (₹ {formatIndianNumber(Math.round(totalValue))})
              </p>
            </div>

            {/* Chart */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm flex-1 min-h-[300px]">
              <h3 className="font-semibold text-[var(--color-ink)] mb-6">Wealth Growth Over Time</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-ink-tertiary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-ink-tertiary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 12 }} 
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="var(--color-cat-finance)" strokeWidth={2} fillOpacity={1} fill="url(#colorReturns)" />
                    <Area type="monotone" dataKey="invested" stroke="var(--color-ink-tertiary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* SEO Content / Guide */}
        <article className="mt-16 bg-[var(--color-surface)] rounded-2xl p-8 lg:p-12 border border-[var(--color-border)] shadow-sm max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold mb-6">How does a SIP Calculator work?</h2>
          <div className="article-body">
            <p>A SIP (Systematic Investment Plan) calculator helps you calculate the wealth gain and expected returns for your monthly mutual fund investments. It uses the compound interest formula to show you how small regular investments can grow into a massive corpus over time.</p>
            <h3>The Formula Behind SIP Returns</h3>
            <p>The mathematical formula used by SIP calculators is:</p>
            <p className="font-[family-name:var(--font-mono)] bg-[var(--color-surface-alt)] p-4 rounded-xl text-center">
              M = P × ({(1 + 'i')}^n - 1) / i × (1 + i)
            </p>
            <p>Where:<br/>
              <strong>M</strong> = Maturity amount<br/>
              <strong>P</strong> = Regular monthly investment<br/>
              <strong>n</strong> = Number of payments (months)<br/>
              <strong>i</strong> = Periodic rate of interest (annual rate / 12)
            </p>
            <h3>Why you should start a SIP early</h3>
            <p>Because of compounding, the time you stay invested is far more important than the amount you invest. A ₹5,000 monthly SIP started at age 25 will yield a larger retirement corpus than a ₹15,000 monthly SIP started at age 40 (assuming the same 12% return rate).</p>
          </div>
        </article>

      </div>
    </div>
  );
}
