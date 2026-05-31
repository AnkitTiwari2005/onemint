'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart2, Eye, Users, Clock, Globe,
  ArrowUp, ArrowDown, Loader2, RefreshCw,
  AlertTriangle, Monitor, Smartphone, Tablet, Tv,
  TrendingUp, Activity, Copy, CheckCircle, Key, FileText, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import type { AnalyticsStats } from '@/app/api/admin/analytics/route';
import { getCachedAnalytics, setCachedAnalytics, clearAnalyticsCache, getCacheAge } from '@/lib/analyticsCache';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmtSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format elapsed seconds into a human-readable age string */
function formatAge(sec: number): string {
  if (sec < 60)  return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

const DEVICE_COLORS: Record<string, string> = {
  Mobile:   '#16A34A',
  Desktop:  '#2563EB',
  Tablet:   '#D97706',
  'Smart tv': '#7C3AED',
  'Smart TV': '#7C3AED',
};
const DEVICE_ICONS: Record<string, React.ElementType> = {
  Mobile:   Smartphone,
  Desktop:  Monitor,
  Tablet:   Tablet,
  'Smart tv': Tv,
  'Smart TV': Tv,
};
const FALLBACK_COLORS = ['#16A34A','#2563EB','#D97706','#7C3AED','#0891B2','#9D174D'];

const SOURCE_COLOR: Record<string, string> = {
  'Organic Search': '#16A34A',
  'Direct':         '#2563EB',
  'Social':         '#7C3AED',
  'Referral':       '#D97706',
  'Email':          '#0891B2',
  'Paid Search':    '#9D174D',
};

// ── Premium donut chart ──────────────────────────────────────────────────────
function DeviceDonut({ deviceSplit }: { deviceSplit: AnalyticsStats['deviceSplit'] }) {
  if (!deviceSplit.length) {
    return (
      <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {(['Mobile','Desktop','Tablet'] as const).map((d, i) => {
          const IC = DEVICE_ICONS[d] ?? Monitor;
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IC size={16} color={FALLBACK_COLORS[i]} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{d}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const top = deviceSplit.reduce((a, b) => (b.pct > a.pct ? b : a), deviceSplit[0]);

  return (
    <div>
      {/* Donut */}
      <div style={{ position: 'relative', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deviceSplit}
              dataKey="pct"
              nameKey="device"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {deviceSplit.map((entry, i) => (
                <Cell
                  key={entry.device}
                  fill={DEVICE_COLORS[entry.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v ?? 0}%`, 'Share']}
              contentStyle={{
                fontFamily: 'var(--font-ui)', fontSize: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 800, color: DEVICE_COLORS[top.device] || 'var(--color-accent)', margin: 0, lineHeight: 1 }}>{top.pct}%</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-ink-tertiary)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{top.device}</p>
        </div>
      </div>

      {/* Custom legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 4 }}>
        {deviceSplit.map((entry, i) => {
          const color = DEVICE_COLORS[entry.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          const IC = DEVICE_ICONS[entry.device] ?? Monitor;
          return (
            <div key={entry.device} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <IC size={11} color={color} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-secondary)' }}>
                {entry.device} <strong style={{ color }}>{entry.pct}%</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── OAuth setup banner ────────────────────────────────────────────────────────
// Shown once after /api/admin/analytics/oauth redirects here with ?refresh_token=
function OAuthTokenBanner({ token, onDismiss }: { token: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the text
      const el = document.getElementById('oauth-refresh-token');
      if (el) (el as HTMLInputElement).select();
    }
  }, [token]);

  return (
    <div style={{
      marginBottom: 24,
      padding: '16px 20px',
      background: '#EFF6FF',
      border: '1px solid #3B82F6',
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Key size={18} color="#2563EB" />
        <strong style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#1E40AF' }}>
          Google OAuth Completed — Copy Your Refresh Token
        </strong>
      </div>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: '#1E40AF', margin: '0 0 10px' }}>
        Add this as <code style={{ background: '#DBEAFE', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono, monospace)' }}>GA4_REFRESH_TOKEN</code> in your Vercel environment variables, then redeploy.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <input
          id="oauth-refresh-token"
          readOnly
          value={token}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            background: 'white',
            border: '1px solid #93C5FD',
            borderRadius: 8,
            color: '#1E40AF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: copied ? '#16A34A' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #D1D5DB',
            borderRadius: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Report helpers ────────────────────────────────────────────────────────────
function getDurationLabel(duration: string, customFrom?: string, customTo?: string): string {
  switch (duration) {
    case 'last7':    return 'Last 7 Days';
    case 'last30':   return 'Last 30 Days';
    case 'last90':   return 'Last 90 Days';
    case 'thisYear': return `Year ${new Date().getFullYear()}`;
    case 'lifetime': return 'Lifetime';
    case 'custom':   return customFrom && customTo ? `${customFrom} → ${customTo}` : 'Custom Range';
    default:         return 'All Time';
  }
}

// ── SVG strings for the report HTML (inline, no external deps) ───────────────
const R = {
  eye:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  users:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  clock:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  bounce: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  mail:   `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  file:   `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  check:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn:   `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  clock2: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  bar:    `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
};

// ── Premium PDF Report HTML Builder ──────────────────────────────────────────
function buildReportHTML(
  duration: string,
  data: AnalyticsStats,
  customFrom?: string,
  customTo?: string,
): string {
  const label = getDurationLabel(duration, customFrom, customTo);
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const maxViews    = Math.max(...data.weeklyChart.map(d => d.views), 1);
  const maxMonthly  = Math.max(...data.monthlyChart.map(d => d.views), 1);

  const engagementScore = Math.max(0, Math.min(100, Math.round(
    (1 - data.bounceRate / 100) * 50 +
    Math.min(data.avgSessionSec / 300, 1) * 30 +
    Math.min(data.pageViews / 10000, 1) * 20,
  )));
  const scoreColor = engagementScore >= 70 ? '#16A34A' : engagementScore >= 40 ? '#D97706' : '#DC2626';

  const weeklyBars = data.weeklyChart.map(d => `
    <div class="bar-group">
      <div class="bar-track"><div class="bar-fill green" style="height:${Math.round((d.views / maxViews) * 100)}%"></div></div>
      <div class="bar-label">${d.day}</div>
      <div class="bar-val">${d.views.toLocaleString('en-IN')}</div>
    </div>`).join('');

  const monthlyBars = data.monthlyChart.map(d => `
    <div class="bar-group">
      <div class="bar-track"><div class="bar-fill blue" style="height:${Math.round((d.views / maxMonthly) * 100)}%"></div></div>
      <div class="bar-label">${d.month}</div>
    </div>`).join('');

  const articleRows = data.topArticles.slice(0, 10).map((a, i) => `
    <tr class="${i % 2 === 0 ? 're' : 'ro'}">
      <td class="rank"><div class="rank-badge" style="background:${i < 3 ? ['#16A34A','#2563EB','#7C3AED'][i] : '#CBD5E1'}">${i + 1}</div></td>
      <td class="ttl">${a.title.length > 68 ? a.title.slice(0, 68) + '…' : a.title}</td>
      <td class="vws">${a.views.toLocaleString('en-IN')}</td>
      <td class="${a.trend === 'up' ? 'tup' : 'tdn'}">${a.trend === 'up'
        ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`
      }</td>
    </tr>`).join('');

  const deviceRows = data.deviceSplit.map((d, i) => {
    const c = DEVICE_COLORS[d.device] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    return `<div class="aud-row"><div class="aud-name">${d.device}</div><div class="aud-track"><div class="aud-fill" style="width:${d.pct}%;background:${c}"></div></div><div class="aud-pct">${d.pct}%</div></div>`;
  }).join('');

  const sourceRows = data.trafficSources.map(s => {
    const c = SOURCE_COLOR[s.source] || '#6B7280';
    return `<div class="aud-row"><div class="src-dot" style="background:${c}"></div><div class="aud-name" style="width:120px">${s.source}</div><div class="aud-track"><div class="aud-fill" style="width:${s.pct}%;background:${c}"></div></div><div class="aud-pct">${s.pct}%</div></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>OneMint Analytics Report — ${label}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:13px}
body{font-family:'Inter',-apple-system,sans-serif;background:#fff;color:#0F172A;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* COVER */
.cover{width:100%;min-height:100vh;display:flex;flex-direction:column;page-break-after:always;position:relative;overflow:hidden}
.cover-bg{position:absolute;inset:0;background:linear-gradient(145deg,#060D1A 0%,#0A1628 38%,#071A0E 72%,#060D1A 100%)}
.g1{position:absolute;top:-140px;right:-140px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(22,163,74,.24) 0%,transparent 65%)}
.g2{position:absolute;bottom:-110px;left:-110px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.17) 0%,transparent 65%)}
.g3{position:absolute;top:44%;left:28%;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.09) 0%,transparent 65%)}
.cc{position:relative;z-index:2;display:flex;flex-direction:column;height:100%;min-height:100vh;padding:50px 58px}
.c-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:auto}
.c-logo{display:flex;align-items:center;gap:11px}
.c-mark{width:40px;height:40px;border-radius:9px;background:linear-gradient(135deg,#16A34A,#0A5E2A);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;box-shadow:0 4px 18px rgba(22,163,74,.38)}
.c-brand{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em}
.c-brand span{color:#4ADE80}
.c-conf{font-size:10px;color:rgba(255,255,255,.32);text-align:right;line-height:1.7;font-weight:500}
.c-mid{padding:64px 0 32px}
.c-ey{display:flex;align-items:center;gap:7px;margin-bottom:16px}
.c-dot{width:5px;height:5px;border-radius:50%;background:#4ADE80}
.c-ey-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#4ADE80}
.c-h{font-size:56px;font-weight:900;color:#fff;line-height:1.0;letter-spacing:-.035em;margin-bottom:12px}
.c-h em{color:#4ADE80;font-style:normal}
.c-bar{width:44px;height:3px;background:linear-gradient(90deg,#16A34A,#4ADE80);border-radius:999px;margin-bottom:18px}
.c-p{font-size:15px;color:rgba(255,255,255,.48);line-height:1.7;max-width:440px;margin-bottom:30px}
.c-pill{display:inline-flex;align-items:center;gap:9px;padding:9px 18px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.75);font-size:13px;font-weight:500;margin-bottom:48px}
.c-kpis{display:flex;gap:36px}
.c-kpi-v{font-size:27px;font-weight:800;color:#fff;letter-spacing:-.02em;line-height:1}
.c-kpi-l{font-size:11px;color:rgba(255,255,255,.38);margin-top:4px}
.c-bot{margin-top:auto}
.c-line{height:1px;background:linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.18),rgba(255,255,255,.06));margin-bottom:20px}
.c-foot{display:flex;align-items:center;justify-content:space-between;font-size:11px}
.c-gen{color:rgba(255,255,255,.34)}
.c-gen strong{color:rgba(255,255,255,.58)}
.c-disc{font-size:10px;color:rgba(255,255,255,.2);text-align:right}

/* SECTIONS */
.sec{padding:38px 52px}
.sec+.sec{border-top:1px solid #E2E8F0}
.stag{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#16A34A;padding:3px 9px;border-radius:999px;background:#F0FDF4;border:1px solid #BBF7D0;margin-bottom:5px}
.stitle{font-size:19px;font-weight:800;color:#0F172A;letter-spacing:-.02em}
.ssub{font-size:12px;color:#64748B;margin-top:3px;margin-bottom:18px}

/* METRICS */
.mg{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-bottom:16px}
.mc{padding:15px 16px;border-radius:11px;border:1px solid #E2E8F0;background:#fff;position:relative;overflow:hidden}
.mc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:11px 11px 0 0}
.mc.g::before{background:linear-gradient(90deg,#16A34A,#4ADE80)}
.mc.b::before{background:linear-gradient(90deg,#2563EB,#60A5FA)}
.mc.p::before{background:linear-gradient(90deg,#7C3AED,#A78BFA)}
.mc.a::before{background:linear-gradient(90deg,#D97706,#FCD34D)}
.mc.t::before{background:linear-gradient(90deg,#0891B2,#22D3EE)}
.mc.r::before{background:linear-gradient(90deg,#9D174D,#FB7185)}
.mc-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.mi{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center}
.mi.g{background:#DCFCE7;color:#16A34A}.mi.b{background:#DBEAFE;color:#2563EB}.mi.p{background:#EDE9FE;color:#7C3AED}
.mi.a{background:#FEF3C7;color:#D97706}.mi.t{background:#CFFAFE;color:#0891B2}.mi.r{background:#FFE4E6;color:#9D174D}
.mv{font-size:23px;font-weight:800;letter-spacing:-.02em;margin-bottom:2px}
.mv.g{color:#16A34A}.mv.b{color:#2563EB}.mv.p{color:#7C3AED}.mv.a{color:#D97706}.mv.t{color:#0891B2}.mv.r{color:#9D174D}
.ml{font-size:10px;color:#64748B;font-weight:500}

/* ENGAGEMENT */
.eng{padding:16px 18px;border-radius:11px;background:linear-gradient(135deg,#F0FDF4,#EFF6FF);border:1px solid #E2E8F0;display:flex;align-items:center;gap:20px}
.e-ring{width:62px;height:62px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;border:2.5px solid #E2E8F0}
.e-n{font-size:18px;font-weight:900;line-height:1}
.e-d{font-size:9px;color:#94A3B8;font-weight:500}
.e-right{flex:1}
.e-lbl{font-size:11px;font-weight:700;color:#334155;margin-bottom:6px}
.e-track{height:6px;background:#E2E8F0;border-radius:999px;overflow:hidden;margin-bottom:3px}
.e-fill{height:100%;border-radius:999px}
.e-hint{font-size:10px;color:#94A3B8;line-height:1.5}

/* INSIGHTS */
.ins-row{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.ins{padding:13px 14px;border-radius:10px;border:1px solid}
.ins.pos{border-color:#BBF7D0;background:linear-gradient(135deg,#F0FDF4,#fff)}
.ins.neu{border-color:#BFDBFE;background:linear-gradient(135deg,#EFF6FF,#fff)}
.ins.wrn{border-color:#FDE68A;background:linear-gradient(135deg,#FFFBEB,#fff)}
.ins-h{display:flex;align-items:center;gap:5px;margin-bottom:5px}
.ins-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#334155}
.ins-b{font-size:11px;color:#475569;line-height:1.55}

/* CHARTS */
.chart-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chart-card{border:1px solid #E2E8F0;border-radius:11px;padding:14px;background:#FAFAFA}
.cc-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid #E2E8F0}
.chart-area{display:flex;align-items:flex-end;gap:4px;height:100px;padding-bottom:16px}
.bar-group{display:flex;flex-direction:column;align-items:center;flex:1;height:100%}
.bar-track{flex:1;width:100%;display:flex;align-items:flex-end;max-width:24px;margin:0 auto}
.bar-fill{width:100%;border-radius:3px 3px 0 0;min-height:3px}
.bar-fill.green{background:linear-gradient(180deg,#4ADE80,#16A34A)}
.bar-fill.blue{background:linear-gradient(180deg,#60A5FA,#2563EB)}
.bar-label{font-size:9px;color:#94A3B8;margin-top:4px;text-align:center;white-space:nowrap}
.bar-val{font-size:8px;color:#CBD5E1;text-align:center;margin-top:1px}

/* ARTICLES */
.atbl{width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden}
.atbl thead tr{background:linear-gradient(90deg,#F8FAFC,#F1F5F9)}
.atbl th{padding:9px 13px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;border-bottom:2px solid #E2E8F0}
.atbl td{padding:11px 13px;font-size:12px;border-bottom:1px solid #F1F5F9;vertical-align:middle}
.re{background:#fff}.ro{background:#FAFBFC}
.rank{width:42px;text-align:center}
.rbadge{width:21px;height:21px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;margin:0 auto}
.ttl{color:#1E293B;font-weight:500;line-height:1.4}
.vws{font-weight:800;color:#2563EB;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:12px}
.tup,.tdn{text-align:center;vertical-align:middle}

/* AUDIENCE */
.aud-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.aud-card{border:1px solid #E2E8F0;border-radius:11px;padding:14px;background:#FAFAFA}
.aud-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748B;margin-bottom:12px;padding-bottom:7px;border-bottom:1px solid #E2E8F0}
.aud-row{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.aud-name{font-size:11px;color:#334155;width:68px;flex-shrink:0;font-weight:500}
.aud-track{flex:1;height:7px;background:#F1F5F9;border-radius:999px;overflow:hidden}
.aud-fill{height:100%;border-radius:999px}
.aud-pct{font-size:11px;font-weight:800;width:34px;text-align:right}
.src-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* FOOTER */
.pfooter{padding-top:14px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94A3B8}
.pfooter strong{color:#475569}
.wm{text-align:center;padding:16px 0 4px;font-size:10px;color:#E2E8F0;letter-spacing:.06em;text-transform:uppercase;font-weight:600}

@page{size:A4;margin:10mm 0}
@media print{.sec{page-break-inside:avoid}body{font-size:12px}}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-bg"></div><div class="g1"></div><div class="g2"></div><div class="g3"></div>
  <div class="cc">
    <div class="c-top">
      <div class="c-logo">
        <div class="c-mark">O</div>
        <div class="c-brand">One<span>Mint</span></div>
      </div>
      <div class="c-conf"><div style="color:rgba(255,255,255,.52);font-size:11px">Confidential</div><div>Internal Use Only</div></div>
    </div>
    <div class="c-mid">
      <div class="c-ey"><div class="c-dot"></div><div class="c-ey-t">Analytics Report</div></div>
      <div class="c-h">Performance<br/><em>Dashboard</em></div>
      <div class="c-bar"></div>
      <div class="c-p">Comprehensive analytics insights, content performance metrics, and audience intelligence for your editorial platform.</div>
      <div class="c-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${label}
      </div>
      <div class="c-kpis">
        <div><div class="c-kpi-v">${data.pageViews.toLocaleString('en-IN')}</div><div class="c-kpi-l">Page Views</div></div>
        <div><div class="c-kpi-v">${data.uniqueVisitors.toLocaleString('en-IN')}</div><div class="c-kpi-l">Unique Visitors</div></div>
        <div><div class="c-kpi-v">${data.totalSubscribers.toLocaleString('en-IN')}</div><div class="c-kpi-l">Subscribers</div></div>
      </div>
    </div>
    <div class="c-bot">
      <div class="c-line"></div>
      <div class="c-foot">
        <div class="c-gen">Generated on <strong>${generatedAt} IST</strong></div>
        <div class="c-disc">Data sourced from Google Analytics 4 &middot; onemint.in</div>
      </div>
    </div>
  </div>
</div>

<!-- EXECUTIVE SUMMARY -->
<div class="sec">
  <div class="stag"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Executive Summary</div>
  <div class="stitle">Key Performance Metrics</div>
  <div class="ssub">Core indicators for: ${label}</div>
  <div class="mg">
    <div class="mc g"><div class="mc-h"><div class="mi g">${R.eye}</div></div><div class="mv g">${data.pageViews.toLocaleString('en-IN')}</div><div class="ml">Total Page Views</div></div>
    <div class="mc b"><div class="mc-h"><div class="mi b">${R.users}</div></div><div class="mv b">${data.uniqueVisitors.toLocaleString('en-IN')}</div><div class="ml">Unique Visitors</div></div>
    <div class="mc p"><div class="mc-h"><div class="mi p">${R.clock}</div></div><div class="mv p">${fmtSec(data.avgSessionSec)}</div><div class="ml">Avg. Session Duration</div></div>
    <div class="mc a"><div class="mc-h"><div class="mi a">${R.bounce}</div></div><div class="mv a">${data.bounceRate}%</div><div class="ml">Bounce Rate</div></div>
    <div class="mc t"><div class="mc-h"><div class="mi t">${R.mail}</div></div><div class="mv t">${data.totalSubscribers.toLocaleString('en-IN')}</div><div class="ml">Newsletter Subscribers</div></div>
    <div class="mc r"><div class="mc-h"><div class="mi r">${R.file}</div></div><div class="mv r">${data.totalArticles.toLocaleString('en-IN')}</div><div class="ml">Published Articles</div></div>
  </div>
  <div class="eng">
    <div class="e-ring" style="border-color:${scoreColor}28"><div class="e-n" style="color:${scoreColor}">${engagementScore}</div><div class="e-d">/100</div></div>
    <div class="e-right">
      <div class="e-lbl">Overall Engagement Score</div>
      <div class="e-track"><div class="e-fill" style="width:${engagementScore}%;background:linear-gradient(90deg,${scoreColor},${scoreColor}77)"></div></div>
      <div class="e-hint">Composite score: bounce rate (50%) + session duration (30%) + traffic volume (20%)</div>
    </div>
  </div>
</div>

<!-- INSIGHTS -->
<div class="sec">
  <div class="stag"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Intelligence</div>
  <div class="stitle">Key Insights &amp; Analysis</div>
  <div class="ssub">Automated observations derived from your analytics data</div>
  <div class="ins-row">
    <div class="ins ${data.bounceRate < 55 ? 'pos' : 'wrn'}">
      <div class="ins-h">${data.bounceRate < 55 ? R.check : R.warn}<div class="ins-t">${data.bounceRate < 55 ? 'Strong Engagement' : 'High Bounce Rate'}</div></div>
      <div class="ins-b">${data.bounceRate < 55 ? `Bounce rate of ${data.bounceRate}% is excellent \u2014 visitors engage deeply with content.` : `Bounce rate of ${data.bounceRate}% is above benchmark. Improve content relevance and page UX.`}</div>
    </div>
    <div class="ins neu">
      <div class="ins-h">${R.clock2}<div class="ins-t">Session Quality</div></div>
      <div class="ins-b">Avg. session of ${fmtSec(data.avgSessionSec)} ${data.avgSessionSec > 120 ? 'shows readers investing quality time in content.' : 'suggests room to improve content depth and internal linking.'}</div>
    </div>
    <div class="ins pos">
      <div class="ins-h">${R.bar}<div class="ins-t">Content Scale</div></div>
      <div class="ins-b">${data.totalArticles} articles with ${data.totalSubscribers.toLocaleString('en-IN')} subscribers \u2014 a strong editorial-to-audience ratio.</div>
    </div>
  </div>
</div>

<!-- TRAFFIC TRENDS -->
${(data.weeklyChart.length > 0 || data.monthlyChart.length > 0) ? `
<div class="sec">
  <div class="stag"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Traffic Analysis</div>
  <div class="stitle">Page View Trends</div>
  <div class="ssub">Visualizing reader traffic patterns over the selected period</div>
  <div class="chart-2">
    ${data.weeklyChart.length > 0 ? `<div class="chart-card"><div class="cc-t">Daily Views</div><div class="chart-area">${weeklyBars}</div></div>` : ''}
    ${data.monthlyChart.length > 0 ? `<div class="chart-card"><div class="cc-t">Monthly Trend</div><div class="chart-area">${monthlyBars}</div></div>` : ''}
  </div>
</div>` : ''}

<!-- CONTENT PERFORMANCE -->
${data.topArticles.length > 0 ? `
<div class="sec">
  <div class="stag"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Content Performance</div>
  <div class="stitle">Top Performing Articles</div>
  <div class="ssub">Ranked by page views for ${label}</div>
  <table class="atbl">
    <thead><tr><th>#</th><th>Article Title</th><th style="text-align:right">Views</th><th style="text-align:center">Trend</th></tr></thead>
    <tbody>${articleRows}</tbody>
  </table>
</div>` : ''}

<!-- AUDIENCE INTELLIGENCE -->
<div class="sec">
  <div class="stag"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Audience Intelligence</div>
  <div class="stitle">Device &amp; Traffic Source Breakdown</div>
  <div class="ssub">Understanding how and where your audience finds you</div>
  <div class="aud-grid">
    <div class="aud-card">
      <div class="aud-t">Device Split</div>
      ${data.deviceSplit.length > 0 ? deviceRows : '<div style="font-size:12px;color:#94A3B8;padding:6px 0">No device data available for this period.</div>'}
    </div>
    <div class="aud-card">
      <div class="aud-t">Traffic Sources</div>
      ${data.trafficSources.length > 0 ? sourceRows : '<div style="font-size:12px;color:#94A3B8;padding:6px 0">No source data available for this period.</div>'}
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="sec">
  <div class="pfooter">
    <div>OneMint Analytics &middot; <strong>${label}</strong> &middot; Generated ${generatedAt} IST</div>
    <div>Confidential &middot; Not for external distribution &middot; onemint.in</div>
  </div>
  <div class="wm">OneMint &mdash; India&rsquo;s Most Trusted Knowledge Platform</div>
</div>

<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},900);});</script>
</body>
</html>`;
}

// ── Duration options (SVG icons — no emojis) ─────────────────────────────────
const DURATION_OPTIONS = [
  {
    id: 'last7', label: 'Last 7 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="3"/></svg>,
  },
  {
    id: 'last30', label: 'Last 30 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="4" height="4" rx="1" fill="currentColor" stroke="none"/></svg>,
  },
  {
    id: 'last90', label: 'Last 90 Days',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 15h4m-2-2v4" strokeWidth="2"/></svg>,
  },
  {
    id: 'thisYear', label: 'This Year',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'lifetime', label: 'Lifetime',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    id: 'custom', label: 'Custom Range',
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  },
];

// ── Generate Report Modal ─────────────────────────────────────────────────────
function ReportModal({
  isOpen,
  onClose,
  onGenerate,
  fetching,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (duration: string, customFrom?: string, customTo?: string) => void;
  fetching: boolean;
}) {
  const [selected, setSelected]     = useState('last30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]     = useState('');

  if (!isOpen) return null;

  const canGenerate = !fetching && (selected !== 'custom' || (!!customFrom && !!customTo));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        width: '100%', maxWidth: 500,
        padding: '26px 26px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.35)',
        animation: 'modal-in 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={18} color="var(--color-accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>Generate Report</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)' }}>Select a reporting period to continue</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-alt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-ink-tertiary)',
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Duration grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 18 }}>
          {DURATION_OPTIONS.map((d) => {
            const active = selected === d.id;
            return (
              <button
                key={d.id}
                onClick={() => !fetching && setSelected(d.id)}
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: active ? 'color-mix(in srgb, var(--color-accent) 9%, transparent)' : 'var(--color-surface-alt)',
                  color: active ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: fetching ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: fetching ? 0.6 : 1,
                }}
              >
                {d.icon}
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Custom date range */}
        {selected === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {(['From', 'To'] as const).map((lbl) => (
              <div key={lbl}>
                <label style={{
                  fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700,
                  color: 'var(--color-ink-tertiary)', display: 'block',
                  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{lbl}</label>
                <input
                  type="date"
                  value={lbl === 'From' ? customFrom : customTo}
                  onChange={(e) => lbl === 'From' ? setCustomFrom(e.target.value) : setCustomTo(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px',
                    borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-alt)',
                    fontFamily: 'var(--font-ui)', fontSize: 13,
                    color: 'var(--color-ink)', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        <div style={{
          padding: '10px 14px', borderRadius: 9,
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          marginBottom: 18,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--color-ink-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.6 }}>
            The report opens in a new tab. Use <strong>Print → Save as PDF</strong> to export. Formatted for A4, suitable for executive presentations.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 9 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 18px',
              borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-surface-alt)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500,
              color: 'var(--color-ink-secondary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => canGenerate && onGenerate(selected, customFrom || undefined, customTo || undefined)}
            disabled={!canGenerate}
            style={{
              flex: 2, padding: '10px 18px',
              borderRadius: 10, border: 'none',
              background: canGenerate ? 'var(--color-accent)' : 'var(--color-ink-tertiary)',
              fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
              color: 'white', cursor: canGenerate ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'opacity 0.15s',
            }}
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {fetching ? 'Fetching GA4 data…' : 'Generate PDF Report'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
// Inner component — must be wrapped in <Suspense> because it uses useSearchParams()
function AnalyticsPageContent() {
  const searchParams = useSearchParams();
  const [oauthToken, setOauthToken] = useState<string | null>(null);
  const [period, setPeriod]         = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData]             = useState<AnalyticsStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [cacheAge, setCacheAge]     = useState<number | null>(null);
  const [reportOpen, setReportOpen]     = useState(false);
  const [reportFetching, setReportFetching] = useState(false);
  const [reportError, setReportError] = useState('');

  // Pick up refresh_token from OAuth redirect and clean the URL
  useEffect(() => {
    const token = searchParams.get('refresh_token');
    if (token) {
      setOauthToken(token);
      const clean = new URL(window.location.href);
      clean.searchParams.delete('refresh_token');
      window.history.replaceState({}, '', clean.toString());
    }
  }, [searchParams]);

  const load = async (force = false) => {
    if (force) clearAnalyticsCache();

    const cached = getCachedAnalytics();
    if (cached) {
      setData(cached);
      setCacheAge(getCacheAge());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCachedAnalytics(json);
      setData(json);
      setCacheAge(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Live-tick the cache age every second
  useEffect(() => {
    const id = setInterval(() => {
      const age = getCacheAge();
      if (age !== null) setCacheAge(age);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Generate Report — fetches fresh GA4 data for the selected range ─────────
  const handleGenerateReport = useCallback(async (
    duration: string,
    customFrom?: string,
    customTo?: string,
  ) => {
    setReportFetching(true);
    try {
      // Build the query param for the API
      let url = '/api/admin/analytics?';
      if (duration === 'custom' && customFrom && customTo) {
        url += `start=${encodeURIComponent(customFrom)}&end=${encodeURIComponent(customTo)}`;
      } else {
        url += `start=${encodeURIComponent(duration)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const freshData: AnalyticsStats = await res.json();

      setReportOpen(false);
      const win = window.open('', '_blank', 'width=1100,height=800');
      if (!win) {
        setReportError('Please allow pop-ups for this site, then try again.');
        setTimeout(() => setReportError(''), 5000);
        return;
      }
      win.document.write(buildReportHTML(duration, freshData, customFrom, customTo));
      win.document.close();
    } catch (err) {
      setReportError(`Failed to fetch report: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setTimeout(() => setReportError(''), 5000);
    } finally {
      setReportFetching(false);
    }
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div>
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
        <Loader2 size={22} className="animate-spin" />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading GA4 data…</span>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) return (
    <div>
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12 }}>
        <AlertTriangle size={20} color="#DC2626" />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: '#DC2626' }}>{error || 'No data available'}</span>
        <button onClick={() => load(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #FCA5A5', borderRadius: 6, background: '#fff', color: '#DC2626', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    </div>
  );

  const fromGA4 = data.fromGA4;

  // ── Stat cards ───────────────────────────────────────────────────────────
  const stats = [
    { label: 'Page Views',         value: data.pageViews.toLocaleString('en-IN'),       icon: Eye,      color: '#16A34A', ga4: true },
    { label: 'Unique Visitors',    value: data.uniqueVisitors.toLocaleString('en-IN'),  icon: Users,    color: '#2563EB', ga4: true },
    { label: 'Avg. Session',       value: fmtSec(data.avgSessionSec),                   icon: Clock,    color: '#7C3AED', ga4: true },
    { label: 'Bounce Rate',        value: `${data.bounceRate}%`,                        icon: Globe,    color: '#D97706', ga4: true },
    { label: 'Subscribers',        value: data.totalSubscribers.toLocaleString('en-IN'),icon: BarChart2,color: '#0891B2', ga4: false },
    { label: 'Published Articles', value: data.totalArticles.toLocaleString('en-IN'),   icon: Activity, color: '#9D174D', ga4: false },
  ];

  return (
    <div>
      {/* OAuth token banner */}
      {oauthToken && (
        <OAuthTokenBanner token={oauthToken} onDismiss={() => setOauthToken(null)} />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => { if (!reportFetching) setReportOpen(false); }}
        onGenerate={handleGenerateReport}
        fetching={reportFetching}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            Analytics Overview
          </h1>
          {/* Status indicator pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px 3px 7px',
            borderRadius: 999,
            border: `1px solid ${fromGA4 ? '#16A34A33' : '#D9770633'}`,
            background: fromGA4 ? '#16A34A0D' : '#D977060D',
          }}>
            <span style={{ position: 'relative', width: 7, height: 7, display: 'flex' }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: fromGA4 ? '#16A34A' : '#D97706',
                opacity: 0.4,
                animation: 'ga4-ping 1.8s ease-in-out infinite',
              }} />
              <span style={{
                position: 'relative', width: 7, height: 7, borderRadius: '50%',
                background: fromGA4 ? '#16A34A' : '#D97706',
              }} />
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
              color: fromGA4 ? '#16A34A' : '#D97706',
              letterSpacing: '0.02em',
            }}>
              {fromGA4 ? 'Live' : 'Disconnected'}
            </span>
            {cacheAge !== null && cacheAge > 0 ? (
              <>
                <span style={{ color: 'var(--color-border)', fontSize: 10 }}>·</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
                  {formatAge(cacheAge)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Generate Report */}
          <button
            onClick={() => setReportOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              border: '1px solid var(--color-accent)',
              borderRadius: 8,
              background: 'var(--color-accent)',
              color: 'white',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={13} />
            Generate Report
          </button>

          {/* Refresh */}
          <button
            onClick={() => load(true)}
            title="Force refresh from GA4"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
          </button>

          {/* Period toggle */}
          {(['weekly', 'monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${period === p ? 'var(--color-accent)' : 'var(--color-border)'}`, background: period === p ? 'var(--color-accent)' : 'var(--color-surface)', color: period === p ? 'white' : 'var(--color-ink-secondary)', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, ga4 }) => {
          const dimmed = ga4 && !fromGA4;
          return (
            <div key={label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '18px 20px', opacity: dimmed ? 0.4 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={17} color={color} />
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 700, color, margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>
                {dimmed ? '—' : value}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-tertiary)', margin: 0 }}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Timeseries */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>
            Page Views — {period === 'weekly' ? 'Last 7 days' : 'Last 6 months'}
          </h2>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              {period === 'weekly' ? (
                <BarChart data={data.weeklyChart}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="Views" fill="var(--color-accent)" radius={[4,4,0,0]} />
                  <Bar dataKey="unique" name="Unique" fill="#2563EB55" radius={[4,4,0,0]} />
                </BarChart>
              ) : (
                <LineChart data={data.monthlyChart}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Donut */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
            Device Split
          </h2>
          <DeviceDonut deviceSplit={data.deviceSplit} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top articles */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={15} color="var(--color-accent)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              Top Articles This Week
            </h2>
          </div>
          {data.topArticles.length === 0 ? (
            <p style={{ padding: '20px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)' }}>No article data yet.</p>
          ) : data.topArticles.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink-tertiary)', minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
              <p style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink)', margin: 0, lineHeight: 1.3 }}>
                {a.title.slice(0, 45)}{a.title.length > 45 ? '…' : ''}
              </p>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {a.views.toLocaleString('en-IN')}
              </span>
              {a.trend === 'up' ? <ArrowUp size={13} color="#16A34A" /> : <ArrowDown size={13} color="#DC2626" />}
            </div>
          ))}
        </div>

        {/* Traffic sources */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={15} color="var(--color-accent)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Traffic Sources</h2>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.trafficSources.length > 0 ? data.trafficSources.map(s => {
              const color = SOURCE_COLOR[s.source] ?? '#6B7280';
              return (
                <div key={s.source}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-ink-secondary)' }}>{s.source}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            }) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-ink-tertiary)', margin: 0 }}>No traffic source data yet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ga4-ping {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0; }
        }
        @media(max-width:768px){
          [style*="repeat(auto-fill, minmax(170px, 1fr))"]{grid-template-columns:1fr 1fr!important;}
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* Report error toast */}
      {reportError && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#DC2626', color: 'white', padding: '12px 20px', borderRadius: 10, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', maxWidth: 360 }}>
          {reportError}
        </div>
      )}
    </div>
  );
}

// ── Page export — Suspense wrapper required by Next.js for useSearchParams() ──
export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--color-ink-tertiary)' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>Loading analytics…</span>
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  );
}
