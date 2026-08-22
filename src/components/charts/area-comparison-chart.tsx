'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { CHART, CHART_TOOLTIP, CHART_TICK } from '@/lib/constants/chart-theme';

interface AreaComparisonChartProps {
  propertyPricePerSqft: number;
  medianPricePerSqft: number;
  areaName: string;
}

export function AreaComparisonChart({ propertyPricePerSqft, medianPricePerSqft, areaName }: AreaComparisonChartProps) {
  const data = [
    { name: 'This Property', value: propertyPricePerSqft, color: CHART.teal },
    { name: `${areaName} Median`, value: medianPricePerSqft, color: CHART.gold },
  ];

  return (
    <div
      className="h-[220px] sm:h-[200px] w-full -mx-2 sm:mx-0"
      role="img"
      aria-label={`Bar chart comparing this property's price per square foot with the ${areaName} median`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis
            type="number"
            tick={CHART_TICK}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={CHART_TICK}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: 'oklch(0.45 0.078 190 / 0.06)' }}
            contentStyle={CHART_TOOLTIP}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`AED ${Number(value).toLocaleString()}/sqft`]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
