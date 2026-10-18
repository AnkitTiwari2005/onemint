'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianNumber } from '@/lib/utils';

interface HomeLoanBalanceChartProps {
  data: { year: string; principal: number; interest: number; balance: number }[];
}

export default function HomeLoanBalanceChart({ data }: HomeLoanBalanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
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
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorBalance)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
