'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { formatIndianNumber } from '@/lib/utils';

const DEFAULT_COLORS = ['var(--color-accent)', 'var(--color-accent-warm)', '#cbd5e1'];

interface ToolPieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

export default function ToolPieChart({
  data,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 80,
}: ToolPieChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 240 }}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={5} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RechartsTooltip formatter={(val: any) => '₹' + formatIndianNumber(Math.round(Number(val)))} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
