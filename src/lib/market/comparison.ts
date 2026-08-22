import { MarketComparison, Property } from '@/types/property';
import { MARKET_BENCHMARKS, DEFAULT_BENCHMARK, getBenchmark } from '@/data/market-benchmarks';

export function calculateMarketComparison(
  property: Property,
  dldMedianPricePerSqft?: number,
  dldSampleSize?: number,
  dldTrend?: 'rising' | 'falling' | 'stable'
): MarketComparison {
  const areaSlug = property.location.slug || '';
  const benchmark = getBenchmark(areaSlug);
  const propertyPricePerSqft = property.pricePerSqft || (property.area > 0 ? Math.round(property.price / property.area) : 0);

  // Use DLD data if available, otherwise use benchmark
  const medianPricePerSqft = dldMedianPricePerSqft || benchmark?.medianPricePerSqft || DEFAULT_BENCHMARK.medianPricePerSqft;
  const sampleSize = dldSampleSize || 0;
  const trend = dldTrend || benchmark?.trend || DEFAULT_BENCHMARK.trend;

  const percentageDiff = medianPricePerSqft > 0
    ? ((propertyPricePerSqft - medianPricePerSqft) / medianPricePerSqft) * 100
    : 0;

  return {
    medianPricePerSqft,
    propertyPricePerSqft,
    percentageDiff: Math.round(percentageDiff * 10) / 10,
    sampleSize,
    trend,
  };
}

export function getMarketBadge(percentageDiff: number): {
  label: string;
  variant: 'gain' | 'loss' | 'neutral';
} {
  if (percentageDiff <= -10) return { label: `${Math.abs(percentageDiff).toFixed(0)}% below market`, variant: 'gain' };
  if (percentageDiff <= -3) return { label: `${Math.abs(percentageDiff).toFixed(0)}% below market`, variant: 'gain' };
  if (percentageDiff <= 3) return { label: 'At market price', variant: 'neutral' };
  if (percentageDiff <= 10) return { label: `${percentageDiff.toFixed(0)}% above market`, variant: 'loss' };
  return { label: `${percentageDiff.toFixed(0)}% above market`, variant: 'loss' };
}

export { MARKET_BENCHMARKS, DEFAULT_BENCHMARK, getBenchmark };
