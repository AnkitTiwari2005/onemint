'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface InflationChartProps {
  data: { year: string; 'Cost of Living': number; 'Purchasing Power': number }[];
}

export default function InflationChart({ data }: InflationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent-warm)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-accent-warm)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
        <Tooltip formatter={rupeesFormatter} />
        <Area type="monotone" dataKey="Cost of Living" stroke="var(--color-accent-warm)" fill="url(#costGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="Purchasing Power" stroke="var(--color-cat-finance)" fill="url(#powerGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
