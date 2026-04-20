'use client';


import { useState, useMemo } from 'react';
import { SliderInput } from '@/components/SliderInput';
import { formatIndianNumber } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';
import { TrendingUp, Scale } from 'lucide-react';

const COMPARISONS = [
  { id: 'sip-vs-lumpsum', label: 'SIP vs Lumpsum' },
  { id: 'old-vs-new-tax', label: 'Old Tax Regime vs New Tax Regime' },
  { id: 'fd-vs-debt-mf', label: 'FD vs Debt Mutual Fund' },
];

function sipVsLumpsum(monthly: number, lumpsum: number, rate: number, years: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const sipFV = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const lumpsumFV = lumpsum * Math.pow(1 + rate / 100, years);
  const sipInvested = monthly * n;

  const rows: { year: number; SIP: number; Lumpsum: number }[] = [];
  for (let y = 1; y <= years; y++) {
    const ny = y * 12;
    rows.push({
      year: y,
      SIP: Math.round(monthly * ((Math.pow(1 + r, ny) - 1) / r) * (1 + r)),
      Lumpsum: Math.round(lumpsum * Math.pow(1 + rate / 100, y)),
    });
  }
  return { sipFV: Math.round(sipFV), lumpsumFV: Math.round(lumpsumFV), sipInvested, lumpsumInvested: lumpsum, rows };
}

function oldVsNewTax(income: number) {
  // Old regime slabs (FY 2024-25)
  function oldTax(inc: number) {
    const stdDed = 50000;
    const i = Math.max(0, inc - stdDed - 150000); // assume 1.5L 80C
    let tax = 0;
    if (i > 1000000) tax += (i - 1000000) * 0.3;
    if (i > 500000) tax += (Math.min(i, 1000000) - 500000) * 0.2;
    if (i > 250000) tax += (Math.min(i, 500000) - 250000) * 0.05;
    return Math.round(tax * 1.04); // 4% cess
  }
  // New regime slabs (FY 2024-25)
  function newTax(inc: number) {
    const stdDed = 75000;
    const i = Math.max(0, inc - stdDed);
    if (i <= 700000) return 0; // rebate
    let tax = 0;
    if (i > 1500000) tax += (i - 1500000) * 0.3;
    if (i > 1200000) tax += (Math.min(i, 1500000) - 1200000) * 0.2;
    if (i > 1000000) tax += (Math.min(i, 1200000) - 1000000) * 0.15;
    if (i > 700000) tax += (Math.min(i, 1000000) - 700000) * 0.1;
    if (i > 400000) tax += (Math.min(i, 700000) - 400000) * 0.05;
    return Math.round(tax * 1.04);
  }
  return { old: oldTax(income), new: newTax(income) };
}

function fdVsDebtMF(amount: number, fdRate: number, mfRate: number, years: number) {
  const rows: { year: number; FD: number; 'Debt MF': number }[] = [];
  for (let y = 1; y <= years; y++) {
    rows.push({
      year: y,
      FD: Math.round(amount * Math.pow(1 + fdRate / 100, y)),
      'Debt MF': Math.round(amount * Math.pow(1 + mfRate / 100, y)),
    });
  }
  const fdFV = Math.round(amount * Math.pow(1 + fdRate / 100, years));
  const mfFV = Math.round(amount * Math.pow(1 + mfRate / 100, years));
  return { fdFV, mfFV, rows };
}

export default function CompareToolsPage() {
  const [activeComparison, setActiveComparison] = useState('sip-vs-lumpsum');

  // SIP vs Lumpsum state
  const [monthly, setMonthly] = useState(10000);
  const [lumpsum, setLumpsum] = useState(120000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  // Old vs New Tax state
  const [income, setIncome] = useState(1200000);

  // FD vs Debt MF state
  const [fdAmount, setFdAmount] = useState(500000);
  const [fdRate, setFdRate] = useState(7);
  const [mfRate, setMfRate] = useState(8.5);
  const [fdYears, setFdYears] = useState(5);

  const sipResult = useMemo(() => sipVsLumpsum(monthly, lumpsum, rate, years), [monthly, lumpsum, rate, years]);
  const taxResult = useMemo(() => oldVsNewTax(income), [income]);
  const fdResult = useMemo(() => fdVsDebtMF(fdAmount, fdRate, mfRate, fdYears), [fdAmount, fdRate, mfRate, fdYears]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={22} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Compare Investment Options
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-ink-secondary)', fontSize: 15, margin: 0, maxWidth: 580 }}>
          See two investment strategies side-by-side. Adjust the inputs and instantly compare the outcomes.
        </p>
      </div>

      {/* Comparison Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
        {COMPARISONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveComparison(c.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: `1px solid ${activeComparison === c.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: activeComparison === c.id ? 'var(--color-accent)' : 'var(--color-surface)',
              color: activeComparison === c.id ? 'white' : 'var(--color-ink-secondary)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* SIP vs Lumpsum */}
      {activeComparison === 'sip-vs-lumpsum' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Shared Inputs</h3>
              <SliderInput label="Annual Return Rate" value={rate} min={6} max={20} step={0.5} suffix="%" onChange={setRate} />
              <SliderInput label="Investment Period" value={years} min={1} max={30} step={1} suffix=" yrs" onChange={setYears} />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-cat-finance)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-cat-finance)', marginBottom: 12 }}>SIP (Monthly)</h3>
                <SliderInput label="Monthly Investment" value={monthly} min={500} max={100000} step={500} prefix="₹" onChange={setMonthly} />
              </div>
              <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-cat-technology)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-cat-technology)', marginBottom: 12 }}>Lumpsum (One-time)</h3>
                <SliderInput label="One-time Investment" value={lumpsum} min={10000} max={5000000} step={10000} prefix="₹" onChange={setLumpsum} />
              </div>
            </div>
          </div>

          {/* Results Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'SIP', invested: sipResult.sipInvested, value: sipResult.sipFV, color: 'var(--color-cat-finance)' },
              { label: 'Lumpsum', invested: sipResult.lumpsumInvested, value: sipResult.lumpsumFV, color: 'var(--color-cat-technology)' },
            ].map((r) => (
              <div key={r.label} style={{ background: 'var(--color-surface)', border: `1px solid ${r.color}`, borderTop: `4px solid ${r.color}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 8 }}>{r.label} — Final Value</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: r.color, margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{formatIndianNumber(r.value)}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>
                  Invested: ₹{formatIndianNumber(r.invested)} · Returns: ₹{formatIndianNumber(r.value - r.invested)}
                </p>
              </div>
            ))}
          </div>

          {/* Winner */}
          <div style={{ background: sipResult.sipFV > sipResult.lumpsumFV ? 'var(--color-cat-finance-light)' : 'var(--color-cat-technology-light)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 20px', marginBottom: 32, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            🏆 {sipResult.sipFV > sipResult.lumpsumFV ? 'SIP' : 'Lumpsum'} wins by ₹{formatIndianNumber(Math.abs(sipResult.sipFV - sipResult.lumpsumFV))} over {years} years at {rate}% p.a.
          </div>

          {/* Chart */}
          <div style={{ height: 300, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sipResult.rows}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
                <Tooltip formatter={rupeesFormatter} />
                <Legend />
                <Area type="monotone" dataKey="SIP" stroke="var(--color-cat-finance)" fill="var(--color-cat-finance)" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="Lumpsum" stroke="var(--color-cat-technology)" fill="var(--color-cat-technology)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Verdict */}
          <div style={{ marginTop: 24, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 12 }}>When should you choose each?</h3>
            <ul style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li><strong>SIP wins</strong> when markets are volatile — you benefit from rupee cost averaging, buying more units when prices fall.</li>
              <li><strong>Lumpsum wins</strong> when you invest at market lows and the market trends upward consistently — the entire amount compounds from day one.</li>
              <li>For most investors, <strong>SIP is safer</strong> as it removes the need to time the market and builds discipline through regular investing.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Old vs New Tax Regime */}
      {activeComparison === 'old-vs-new-tax' && (
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
            <SliderInput label="Annual Gross Income" value={income} min={300000} max={5000000} step={50000} prefix="₹" onChange={setIncome} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Old Tax Regime', tax: taxResult.old, color: '#DC2626', note: 'Includes ₹50K std. ded. + ₹1.5L 80C' },
              { label: 'New Tax Regime', tax: taxResult.new, color: 'var(--color-accent)', note: 'Includes ₹75K std. ded., no 80C' },
            ].map((r) => (
              <div key={r.label} style={{ background: 'var(--color-surface)', border: `1px solid ${r.color}`, borderTop: `4px solid ${r.color}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 8 }}>{r.label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: r.color, margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{formatIndianNumber(r.tax)}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>{r.note}</p>
              </div>
            ))}
          </div>

          {taxResult.old !== taxResult.new && (
            <div style={{ background: taxResult.new < taxResult.old ? 'var(--color-cat-finance-light)' : '#FEF2F2', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
              🏆 {taxResult.new < taxResult.old ? 'New Regime' : 'Old Regime'} saves you ₹{formatIndianNumber(Math.abs(taxResult.old - taxResult.new))} at ₹{formatIndianNumber(income)} income
            </div>
          )}

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 12 }}>Key differences</h3>
            <ul style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>New regime is default from FY 2024-25. Higher standard deduction (₹75,000 vs ₹50,000).</li>
              <li>Old regime allows 80C, HRA, home loan interest, 80D, LTA deductions. New regime does not.</li>
              <li>If your total deductions exceed ~₹3.75L, the old regime is likely better for higher incomes.</li>
            </ul>
          </div>
        </div>
      )}

      {/* FD vs Debt MF */}
      {activeComparison === 'fd-vs-debt-mf' && (
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
            <SliderInput label="Investment Amount" value={fdAmount} min={10000} max={5000000} step={10000} prefix="₹" onChange={setFdAmount} />
            <SliderInput label="FD Interest Rate" value={fdRate} min={4} max={10} step={0.25} suffix="%" onChange={setFdRate} />
            <SliderInput label="Debt MF Expected Return" value={mfRate} min={5} max={12} step={0.25} suffix="%" onChange={setMfRate} />
            <SliderInput label="Investment Period" value={fdYears} min={1} max={10} step={1} suffix=" yrs" onChange={setFdYears} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'Fixed Deposit', value: fdResult.fdFV, color: '#DC2626', note: 'Guaranteed returns, interest taxed per slab' },
              { label: 'Debt Mutual Fund', value: fdResult.mfFV, color: 'var(--color-accent)', note: 'Market-linked, LTCG at 12.5% after 24 months' },
            ].map((r) => (
              <div key={r.label} style={{ background: 'var(--color-surface)', border: `1px solid ${r.color}`, borderTop: `4px solid ${r.color}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', marginBottom: 8 }}>{r.label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: r.color, margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{formatIndianNumber(r.value)}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)', margin: 0 }}>{r.note}</p>
              </div>
            ))}
          </div>

          <div style={{ height: 280, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fdResult.rows}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
                <Tooltip formatter={rupeesFormatter} />
                <Legend />
                <Area type="monotone" dataKey="FD" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Debt MF" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 12 }}>Tax consideration</h3>
            <ul style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-secondary)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>FD interest is added to your income and taxed at your applicable slab rate (up to 30%).</li>
              <li>Debt MF gains held over 24 months are taxed at 12.5% LTCG — significantly lower for those in the 30% bracket.</li>
              <li>If you are in the 10–15% tax bracket, FDs and Debt MFs are roughly equivalent in post-tax returns.</li>
            </ul>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          [style*="grid-template-rows: 1fr 1fr"] { grid-template-rows: auto auto !important; }
        }
      `}</style>
    </div>
  );
}
