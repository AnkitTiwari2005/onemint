'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianNumber } from '@/lib/utils';

interface HomeLoanPieChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function HomeLoanPieChart({ data }: HomeLoanPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹ ${formatIndianNumber(Number(value))}`, '']} />
      </PieChart>
    </ResponsiveContainer>
  );
}
