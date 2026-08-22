import { InvestmentMetrics, Property } from '@/types/property';
import { getBenchmark, DEFAULT_BENCHMARK } from '@/data/market-benchmarks';
import { BUY_COSTS } from '@/lib/finance'; // shared single source of buying-cost %

export const SELL_COSTS = 0.02; // ~2% agency on exit

export interface RoiYearPoint {
  year: number;
  propertyValue: number; // gross value, compounded appreciation
  totalValue: number; // realizable equity if sold: net sale proceeds + cumulative net rent
  roi: number; // % return on total invested (incl. buying costs)
}

export interface RoiProjection {
  years: RoiYearPoint[];
  fiveYearROI: number;
  totalInvested: number;
}

/**
 * Single source of truth for the 5-year projection. The metric card and the
 * ROI chart both render from this so their numbers can never diverge.
 * Appreciation compounds; rent is cumulative net rent; costs are included.
 */
export function projectRoi(
  price: number,
  netRentalYieldPct: number,
  capitalAppreciationPct: number
): RoiProjection {
  const totalInvested = Math.round(price * (1 + BUY_COSTS));
  const capApp = capitalAppreciationPct / 100;
  const netAnnualRent = price * (netRentalYieldPct / 100);

  const years: RoiYearPoint[] = [0, 1, 2, 3, 4, 5].map((year) => {
    const grossValue = price * Math.pow(1 + capApp, year);
    const netProceeds = grossValue * (1 - SELL_COSTS);
    const cumulativeRent = netAnnualRent * year;
    const totalValue = netProceeds + cumulativeRent;
    const roi = ((totalValue - totalInvested) / totalInvested) * 100;
    return {
      year,
      propertyValue: Math.round(grossValue),
      totalValue: Math.round(totalValue),
      roi: Math.round(roi * 10) / 10,
    };
  });

  return { years, fiveYearROI: Math.round(years[5].roi), totalInvested };
}

export function calculateInvestmentMetrics(property: Property): InvestmentMetrics {
  const areaSlug = property.location.slug || '';
  const benchmark = getBenchmark(areaSlug) || DEFAULT_BENCHMARK;

  const price = property.price;
  const sqft = property.area || 1;

  // Estimate annual rent based on area's average rental yield
  const grossYield = benchmark.avgRentalYield / 100;
  const estimatedAnnualRent = Math.round(price * grossYield);
  const estimatedMonthlyRent = Math.round(estimatedAnnualRent / 12);

  // Gross rental yield
  const grossRentalYield = (estimatedAnnualRent / price) * 100;

  // Service charge (annual)
  const serviceCharge = Math.round(sqft * benchmark.avgServiceCharge);

  // Net rental yield = gross minus deductions
  const vacancyRate = 0.05; // 5%
  const maintenanceRate = 0.01; // 1% of price
  const netAnnualRent = estimatedAnnualRent * (1 - vacancyRate) - serviceCharge - (price * maintenanceRate);
  const netRentalYield = (netAnnualRent / price) * 100;

  // Capital appreciation (conservatively halved from benchmark)
  const capitalAppreciation = benchmark.yoyAppreciation / 2;

  // 5-year projected ROI — compounded, net of buying/exit costs. Shares the
  // exact projection the ROI chart renders so the two never disagree.
  const fiveYearROI = projectRoi(price, netRentalYield, capitalAppreciation).fiveYearROI;

  return {
    grossRentalYield: Math.round(grossRentalYield * 10) / 10,
    netRentalYield: Math.round(netRentalYield * 10) / 10,
    capitalAppreciation: Math.round(capitalAppreciation * 10) / 10,
    fiveYearROI: Math.round(fiveYearROI * 10) / 10,
    estimatedAnnualRent,
    estimatedMonthlyRent,
    serviceCharge,
  };
}
