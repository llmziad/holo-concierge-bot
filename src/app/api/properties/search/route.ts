import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/api/bayut';
import { PropertySearchParams } from '@/types/property';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PropertySearchParams;

    const { properties, total } = await searchProperties(body);

    // Enrich with market data
    const enriched = properties.map((p) => {
      p.marketComparison = calculateMarketComparison(p);
      p.investmentMetrics = calculateInvestmentMetrics(p);
      return p;
    });

    return NextResponse.json({ properties: enriched, total });
  } catch (error) {
    console.error('Property search error:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
