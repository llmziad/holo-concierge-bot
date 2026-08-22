import { NextRequest, NextResponse } from 'next/server';
import { getPropertyDetail } from '@/lib/api/bayut';
import { getTransactions } from '@/lib/api/dld';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await getPropertyDetail(id);

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch DLD data for the area
    const dldData = await getTransactions(property.location.area, property.type);

    // Enrich with market comparison using DLD data
    property.marketComparison = calculateMarketComparison(
      property,
      dldData.metadata.medianPricePerSqft,
      dldData.metadata.totalTransactions,
      undefined
    );

    // Calculate investment metrics
    property.investmentMetrics = calculateInvestmentMetrics(property);

    return NextResponse.json({
      property,
      transactions: dldData.transactions,
      marketMetadata: dldData.metadata,
    });
  } catch (error) {
    console.error('Property detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
