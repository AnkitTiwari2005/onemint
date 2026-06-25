'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatIndianCurrency, formatIndianNumber } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Home, Info, ArrowLeft } from 'lucide-react';

export default function HomeLoanEMIPage() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, totalInterest, totalPayment, chartData, amortization } = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    // EMI = P × r × (1+r)^n / ((1+r)^n - 1)
    const emiCalc = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiCalc * n;
    const totalInt = totalPay - P;

    // Amortization schedule (yearly)
    let balance = P;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const amort: { year: number; principal: number; interest: number; balance: number; totalPaid: number }[] = [];
    const chart: { year: string; principal: number; interest: number; balance: number }[] = [];

    for (let year = 1; year <= tenure; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let month = 0; month < 12; month++) {
        if (balance <= 0) break;
        const interestComponent = balance * r;
        const principalComponent = Math.min(emiCalc - interestComponent, balance);
        yearPrincipal += principalComponent;
        yearInterest += interestComponent;
        balance -= principalComponent;
      }

      totalPrincipalPaid += yearPrincipal;
      totalInterestPaid += yearInterest;

      amort.push({
        year,
        principal: Math.round(yearPrincipal),
        interest: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
        totalPaid: Math.round(totalPrincipalPaid + totalInterestPaid),
      });

      chart.push({
        year: `Yr ${year}`,
        principal: Math.round(totalPrincipalPaid),
        interest: Math.round(totalInterestPaid),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      emi: Math.round(emiCalc),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay),
      chartData: chart,
      amortization: amort,
    };
  }, [loanAmount, interestRate, tenure]);

  const pieData = [
    { name: 'Principal', value: loanAmount, color: 'var(--color-accent)' },
    { name: 'Interest', value: totalInterest, color: 'var(--color-accent-warm)' },
  ];

  const [showAmortization, setShowAmortization] = useState(false);

  return (
    <div className="pt-16 lg:pt-[72px] pb-20 bg-[var(--color-surface-alt)] min-h-screen">
      <div className="max-w-[var(--content-max)] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Back Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6 font-[family-name:var(--font-ui)]">
          <ArrowLeft size={16} /> Back to Tools
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-ink)] mb-4 flex items-center gap-3">
            <Home className="text-[var(--color-accent)]" size={40} />
            Home Loan EMI Calculator
          </h1>
          <p className="text-lg text-[var(--color-ink-secondary)] max-w-2xl font-[family-name:var(--font-body)]">
            Calculate your monthly EMI, total interest payable, and view a complete year-by-year amortization schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card)] p-6 lg:p-8 border border-[var(--color-border)]">

            {/* Loan Amount */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Loan Amount</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  ₹ {formatIndianNumber(loanAmount)}
                </div>
              </div>
              <input
                type="range" min="100000" max="50000000" step="100000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-mono)]">
                <span>₹1L</span><span>₹5Cr</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Interest Rate (p.a.)</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  {interestRate}%
                </div>
              </div>
              <input
                type="range" min="5" max="20" step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-mono)]">
                <span>5%</span><span>20%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">Loan Tenure</label>
                <div className="bg-[var(--color-surface-alt)] px-4 py-2 rounded-lg font-[family-name:var(--font-mono)] font-bold text-lg border border-[var(--color-border)]">
                  {tenure} Yr
                </div>
              </div>
              <input
                type="range" min="1" max="30" step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-ink-tertiary)] mt-2 font-[family-name:var(--font-mono)]">
                <span>1 Yr</span><span>30 Yr</span>
              </div>
            </div>

            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex gap-3 border border-amber-100 font-[family-name:var(--font-body)]">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p>Home loan interest rates in India typically range from 8.25% to 9.5% (2024). Rates vary by lender, loan amount, and credit score.</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* EMI Card */}
            <div className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-warm)] rounded-2xl p-6 lg:p-8 text-center text-white shadow-lg">
              <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Your Monthly EMI</p>
              <p className="font-[family-name:var(--font-mono)] text-4xl lg:text-6xl font-bold">
                ₹ {formatIndianNumber(emi)}
              </p>
              <p className="text-sm opacity-80 mt-2 font-[family-name:var(--font-mono)]">
                per month for {tenure} years
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Principal Amount</p>
                <p className="font-[family-name:var(--font-mono)] text-xl lg:text-2xl font-bold text-[var(--color-ink)]">
                  ₹ {formatIndianNumber(loanAmount)}
                </p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
                <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Total Interest</p>
                <p className="font-[family-name:var(--font-mono)] text-xl lg:text-2xl font-bold text-[var(--color-accent-warm)]">
                  ₹ {formatIndianNumber(totalInterest)}
                </p>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-sm text-center">
              <p className="text-[11px] font-bold text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 font-[family-name:var(--font-ui)]">Total Amount Payable</p>
              <p className="font-[family-name:var(--font-mono)] text-2xl lg:text-3xl font-bold text-[var(--color-ink)]">
                {formatIndianCurrency(totalPayment)}
              </p>
            </div>

            {/* Pie Chart */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)] mb-4 font-[family-name:var(--font-heading)]">Payment Breakdown</h3>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--color-ink-secondary)] font-[family-name:var(--font-ui)]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance Chart */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h3 className="font-semibold text-[var(--color-ink)] mb-6 font-[family-name:var(--font-heading)]">Loan Balance Over Time</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }} dy={10} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} dx={-10} />
                    <Tooltip formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, '']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }} />
                    <Area type="monotone" dataKey="balance" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div className="mt-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAmortization(!showAmortization)}
            className="w-full px-6 lg:px-8 py-5 flex items-center justify-between text-left hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-ink)]">
              Year-by-Year Amortization Schedule
            </h3>
            <span className={`text-[var(--color-ink-tertiary)] text-xl transition-transform ${showAmortization ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showAmortization && (
            <div className="px-6 lg:px-8 pb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border)]">
                    <th className="text-left py-3 px-3 font-[family-name:var(--font-ui)] text-[var(--color-ink-tertiary)] text-[11px] uppercase tracking-wider">Year</th>
                    <th className="text-right py-3 px-3 font-[family-name:var(--font-ui)] text-[var(--color-ink-tertiary)] text-[11px] uppercase tracking-wider">Principal</th>
                    <th className="text-right py-3 px-3 font-[family-name:var(--font-ui)] text-[var(--color-ink-tertiary)] text-[11px] uppercase tracking-wider">Interest</th>
                    <th className="text-right py-3 px-3 font-[family-name:var(--font-ui)] text-[var(--color-ink-tertiary)] text-[11px] uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortization.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--color-ink)] font-[family-name:var(--font-ui)]">{row.year}</td>
                      <td className="py-3 px-3 text-right font-[family-name:var(--font-mono)] text-[var(--color-ink)]">₹{formatIndianNumber(row.principal)}</td>
                      <td className="py-3 px-3 text-right font-[family-name:var(--font-mono)] text-[var(--color-accent-warm)]">₹{formatIndianNumber(row.interest)}</td>
                      <td className="py-3 px-3 text-right font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">₹{formatIndianNumber(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <article className="mt-16 bg-[var(--color-surface)] rounded-2xl p-8 lg:p-12 border border-[var(--color-border)] shadow-sm max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold mb-6 text-[var(--color-ink)]">Home Loan EMI Guide for India</h2>
          <div className="article-body">
            <p>Understanding your home loan EMI is the first step to smarter property ownership. The EMI (Equated Monthly Instalment) is the fixed amount you pay to your bank every month until the loan is fully repaid.</p>
            <h3>How EMI is Calculated</h3>
            <p>EMI is calculated using the formula:</p>
            <p className="font-[family-name:var(--font-mono)] bg-[var(--color-surface-alt)] p-4 rounded-xl text-center">
              EMI = P × r × (1+r)^n / ((1+r)^n − 1)
            </p>
            <p>Where <strong>P</strong> = Principal loan amount, <strong>r</strong> = Monthly interest rate, <strong>n</strong> = Total number of months.</p>
            <h3>Tips to Reduce Your EMI Burden</h3>
            <ul>
              <li><strong>Higher down payment</strong> — reduces principal, lowers EMI</li>
              <li><strong>Longer tenure</strong> — reduces EMI but increases total interest</li>
              <li><strong>Balance transfer</strong> — switch to a lower-rate lender mid-tenure</li>
              <li><strong>Pre-payment</strong> — pay lump sums to reduce outstanding principal</li>
            </ul>
            <h3>Tax Benefits on Home Loans</h3>
            <p>Under Section 24(b), you can claim up to ₹2 lakh deduction on interest paid per year. Under Section 80C, up to ₹1.5 lakh on principal repayment. For first-time buyers, Section 80EEA offers an additional ₹1.5 lakh deduction.</p>
          </div>
        </article>

      </div>
    </div>
  );
}
