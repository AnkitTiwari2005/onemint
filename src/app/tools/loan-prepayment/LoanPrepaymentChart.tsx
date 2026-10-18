'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface LoanPrepaymentChartProps {
  data: { label: string; Principal: number; Interest: number }[];
}

export default function LoanPrepaymentChart({ data }: LoanPrepaymentChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Bar dataKey="Principal" fill="var(--color-cat-finance)" stackId="a" />
        <Bar dataKey="Interest" fill="var(--color-accent-warm)" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
