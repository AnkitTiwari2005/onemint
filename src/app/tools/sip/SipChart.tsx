'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianNumber } from '@/lib/utils';

interface SipChartProps {
  chartData: Array<{ year: string; invested: number; returns: number; total: number }>;
}

export default function SipChart({ chartData }: SipChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-ink-tertiary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-ink-tertiary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 11 }}
            tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
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
  );
}
