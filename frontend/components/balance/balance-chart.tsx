'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartDataPoint } from '@/lib/data/tokens';

interface BalanceChartProps {
  data: ChartDataPoint[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] mt-8 lg:mt-12 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 13 }}
            dy={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 13 }}
            domain={[0, 500]}
            ticks={[100, 200, 300, 400, 500]}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            itemStyle={{ color: 'var(--color-foreground)', fontWeight: 500 }}
            labelStyle={{ color: 'var(--color-neutral-8)', marginBottom: '4px' }}
          />
          <Area
            type="natural"
            dataKey="balance"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
