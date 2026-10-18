'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface RetirementChartProps {
  data: { year: number; Corpus: number }[];
  corpusNeeded: number;
}

export default function RetirementChart({ data, corpusNeeded }: RetirementChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="retireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cat-finance)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-cat-finance)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" tick={{ fontSize: 10 }} label={{ value: 'Age', position: 'insideBottomRight', offset: -4, fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={72} />
        <Tooltip formatter={rupeesFormatter} labelFormatter={(l) => `Age ${l}`} />
        <ReferenceLine y={corpusNeeded} stroke="var(--color-accent-warm)" strokeDasharray="4 2" label={{ value: 'Target', position: 'right', fontSize: 10, fill: 'var(--color-accent-warm)' }} />
        <Area type="monotone" dataKey="Corpus" stroke="var(--color-cat-finance)" fill="url(#retireGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
