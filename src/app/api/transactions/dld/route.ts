import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, getPriceHistory } from '@/lib/api/dld';

export async function GET(req: NextRequest) {
  try {
    const area = req.nextUrl.searchParams.get('area');
    const propertyType = req.nextUrl.searchParams.get('propertyType') || undefined;
    const includePriceHistory = req.nextUrl.searchParams.get('priceHistory') === 'true';

    if (!area) {
      return NextResponse.json({ error: 'Area parameter required' }, { status: 400 });
    }

    const transactions = await getTransactions(area, propertyType);

    let priceHistory = undefined;
    if (includePriceHistory) {
      priceHistory = await getPriceHistory(area);
    }

    return NextResponse.json({
      ...transactions,
      priceHistory,
    });
  } catch (error) {
    console.error('DLD transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
