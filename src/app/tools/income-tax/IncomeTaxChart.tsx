'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatIndianNumber } from '@/lib/utils';

interface IncomeTaxChartProps {
  data: { name: string; tax: number; fill: string }[];
}

export default function IncomeTaxChart({ data }: IncomeTaxChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--color-ink)', fontSize: 13, fontWeight: 600 }}
          width={110}
        />
        <Tooltip
          formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, 'Tax']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        />
        <Bar dataKey="tax" radius={[0, 8, 8, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
