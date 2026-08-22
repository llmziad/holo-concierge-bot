'use client';

import { PriceHistoryPoint } from '@/types/transaction';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CHART, CHART_TOOLTIP, CHART_TICK } from '@/lib/constants/chart-theme';

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  return (
    <div
      className="h-[260px] sm:h-[300px] w-full -mx-2 sm:mx-0"
      role="img"
      aria-label="Line chart of average price per square foot over time"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={CHART_TICK}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={CHART_TICK}
            tickLine={false}
            axisLine={false}
            width={45}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP}
            cursor={{ stroke: CHART.grid }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`AED ${Number(value).toLocaleString()}/sqft`, 'Avg Price']}
          />
          <Line
            type="monotone"
            dataKey="avgPricePerSqft"
            stroke={CHART.teal}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: CHART.teal }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
