'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface FdChartProps {
  data: { year: string; Value: number }[];
}

export default function FdChart({ data }: FdChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fdGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
        <Tooltip formatter={rupeesFormatter} />
        <Area type="monotone" dataKey="Value" stroke="var(--color-cat-finance)" fill="url(#fdGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
