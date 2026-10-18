'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

const CHART_COLORS = [
  'var(--color-cat-career)',
  'var(--color-accent-warm)',
  '#94a3b8',
  '#64748b',
  '#e2e8f0',
  '#cbd5e1',
];

interface TakeHomeChartProps {
  data: { name: string; value: number }[];
}

export default function TakeHomeChart({ data }: TakeHomeChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={rupeesTickFormatter} width={60} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_entry, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
