'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { rupeesFormatter, rupeesTickFormatter } from '@/lib/chartUtils';

interface RentVsBuyChartProps {
  data: { year: string; 'Rent & Invest': number; 'Buy (Net Worth)': number }[];
}

export default function RentVsBuyChart({ data }: RentVsBuyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
      <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={rupeesTickFormatter} width={80} />
        <Tooltip formatter={rupeesFormatter} />
        <Legend />
        <Line type="monotone" dataKey="Rent & Invest" stroke="var(--color-cat-technology)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Buy (Net Worth)" stroke="var(--color-cat-finance)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
