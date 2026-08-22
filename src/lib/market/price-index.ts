import { PriceHistoryPoint, AreaTrend } from '@/types/transaction';
import { MARKET_BENCHMARKS } from '@/data/market-benchmarks';

export function calculateAreaTrend(priceHistory: PriceHistoryPoint[]): AreaTrend | null {
  if (priceHistory.length < 12) return null;

  const recentMonths = priceHistory.slice(-6);
  const previousMonths = priceHistory.slice(-12, -6);

  const recentAvg = recentMonths.reduce((sum, p) => sum + p.avgPricePerSqft, 0) / recentMonths.length;
  const previousAvg = previousMonths.reduce((sum, p) => sum + p.avgPricePerSqft, 0) / previousMonths.length;

  const yoyChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  if (yoyChange > 3) trend = 'rising';
  if (yoyChange < -3) trend = 'falling';

  return {
    area: '',
    currentAvgPricePerSqft: Math.round(recentAvg),
    previousAvgPricePerSqft: Math.round(previousAvg),
    yoyChange: Math.round(yoyChange * 10) / 10,
    trend,
  };
}

export function getTopPerformingAreas(limit: number = 5): AreaTrend[] {
  return Object.entries(MARKET_BENCHMARKS)
    .map(([, b]) => ({
      area: b.area,
      currentAvgPricePerSqft: b.avgPricePerSqft,
      previousAvgPricePerSqft: Math.round(b.avgPricePerSqft / (1 + b.yoyAppreciation / 100)),
      yoyChange: b.yoyAppreciation,
      trend: b.trend,
    }))
    .sort((a, b) => b.yoyChange - a.yoyChange)
    .slice(0, limit);
}
