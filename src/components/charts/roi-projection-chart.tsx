'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { InvestmentMetrics } from '@/types/property';
import { projectRoi } from '@/lib/market/roi-calculator';
import { CHART, CHART_TOOLTIP, CHART_TICK } from '@/lib/constants/chart-theme';

interface ROIProjectionChartProps {
  purchasePrice: number;
  metrics: InvestmentMetrics;
}

export function ROIProjectionChart({ purchasePrice, metrics }: ROIProjectionChartProps) {
  const { years, totalInvested } = projectRoi(
    purchasePrice,
    metrics.netRentalYield,
    metrics.capitalAppreciation
  );
  const data = years.map((y) => ({ year: `Year ${y.year}`, propertyValue: y.propertyValue, totalValue: y.totalValue }));

  return (
    <div
      className="h-[260px] sm:h-[300px] w-full -mx-2 sm:mx-0"
      role="img"
      aria-label="Area chart projecting realizable value and gross property value over five years"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART.emerald} stopOpacity={0.28} />
              <stop offset="95%" stopColor={CHART.emerald} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="year" tick={CHART_TICK} tickLine={false} axisLine={{ stroke: CHART.grid }} />
          <YAxis
            tick={CHART_TICK}
            tickLine={false}
            axisLine={false}
            width={45}
            tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP}
            cursor={{ stroke: CHART.grid }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              `AED ${Number(value).toLocaleString()}`,
              name === 'totalValue' ? 'Realizable value' : 'Gross property value',
            ]}
          />
          <ReferenceLine
            y={totalInvested}
            stroke={CHART.muted}
            strokeDasharray="2 4"
            label={{ value: 'Total invested', position: 'insideTopLeft', fill: CHART.muted, fontSize: 10 }}
          />
          <Area type="monotone" dataKey="totalValue" stroke={CHART.emerald} strokeWidth={2.5} fill="url(#roiGradient)" />
          <Area type="monotone" dataKey="propertyValue" stroke={CHART.teal} strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
