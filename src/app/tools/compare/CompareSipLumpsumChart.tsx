'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface CompareSipLumpsumChartProps {
  data: { year: number; SIP: number; Lumpsum: number }[];
}

export default function CompareSipLumpsumChart({ data }: CompareSipLumpsumChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <AreaChart data={data}>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Area type="monotone" dataKey="SIP" stroke="var(--color-cat-finance)" fill="var(--color-cat-finance)" fillOpacity={0.15} strokeWidth={2} />
        <Area type="monotone" dataKey="Lumpsum" stroke="var(--color-cat-technology)" fill="var(--color-cat-technology)" fillOpacity={0.15} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
