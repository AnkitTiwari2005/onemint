'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface CompareFdDebtMfChartProps {
  data: { year: number; FD: number; 'Debt MF': number }[];
}

export default function CompareFdDebtMfChart({ data }: CompareFdDebtMfChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data}>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Area type="monotone" dataKey="FD" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} strokeWidth={2} />
        <Area type="monotone" dataKey="Debt MF" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.1} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
