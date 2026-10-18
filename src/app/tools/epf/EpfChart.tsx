'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface EpfChartProps {
  data: { year: string; Employee: number; Employer: number; Interest: number }[];
}

export default function EpfChart({ data }: EpfChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Bar dataKey="Employee" fill="var(--color-cat-finance)" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Employer" fill="var(--color-cat-technology)" stackId="a" />
        <Bar dataKey="Interest" fill="var(--color-accent-gold)" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
