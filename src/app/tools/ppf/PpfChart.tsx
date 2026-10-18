'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface PpfChartProps {
  data: { year: string; Invested: number; 'Total Corpus': number }[];
}

export default function PpfChart({ data }: PpfChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-ink-tertiary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-ink-tertiary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Area type="monotone" dataKey="Invested" stroke="var(--color-ink-tertiary)" fill="url(#investGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="Total Corpus" stroke="var(--color-cat-finance)" fill="url(#corpusGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
