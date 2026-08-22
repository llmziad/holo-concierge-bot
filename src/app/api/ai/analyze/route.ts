import { NextRequest, NextResponse } from 'next/server';
import { getPropertyDetail } from '@/lib/api/bayut';
import { getTransactions } from '@/lib/api/dld';
import { analyzeProperty } from '@/lib/ai/analysis';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';
import { enforceRateLimit } from '@/lib/api/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'analyze', 30, 60 * 1000);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { propertyId } = body ?? {};

    if (!propertyId || typeof propertyId !== 'string' || propertyId.length > 64) {
      return NextResponse.json({ error: 'A valid property ID is required' }, { status: 400 });
    }

    const property = await getPropertyDetail(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Ground the analysis in real transaction data where available. `source`
    // ('live' | 'estimated') is threaded into the prompt so the model never
    // presents benchmark estimates as verified DLD data.
    const dld = await getTransactions(property.location.area, property.type);
    property.marketComparison = calculateMarketComparison(
      property,
      dld.metadata.medianPricePerSqft || undefined,
      dld.metadata.totalTransactions,
      undefined
    );
    if (!property.investmentMetrics) {
      property.investmentMetrics = calculateInvestmentMetrics(property);
    }

    const analysis = await analyzeProperty(property, dld.metadata.source);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze property' },
      { status: 500 }
    );
  }
}
