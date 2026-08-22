import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/api/bayut';
import { matchProperties } from '@/lib/ai/matching';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';
import { PROPERTY_TYPE_MAP } from '@/lib/constants/property-types';
import { DUBAI_AREAS } from '@/lib/constants/dubai-areas';
import { enforceRateLimit } from '@/lib/api/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'match', 30, 60 * 1000);
  if (limited) return limited;

  try {
    if (Number(req.headers.get('content-length') || 0) > 20_000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }
    const body = await req.json();
    const { goal, budgetMin, budgetMax, locationId, locationName, areas, propertyType, bedrooms } = body ?? {};

    // Parse bedrooms — empty string or "any" means no filter
    const bedroomsNum = bedrooms !== null && bedrooms !== undefined && bedrooms !== '' && bedrooms !== 'any'
      ? Number(bedrooms)
      : undefined;

    // Convert area slugs to location IDs for the Bayut search
    let locationIds = locationId || '';
    if (!locationIds && areas) {
      const areaSlugs = String(areas).split(',').filter(Boolean).slice(0, 20);
      const areaIds = areaSlugs
        .map((slug) => DUBAI_AREAS.find((a) => a.slug === slug)?.externalID)
        .filter(Boolean);
      if (areaIds.length > 0) {
        locationIds = areaIds.join(',');
      }
    }

    // Build search params
    const searchParams = {
      purpose: 'for-sale' as const,
      priceMin: Number(budgetMin) || undefined,
      priceMax: Number(budgetMax) || undefined,
      locationExternalIDs: locationIds || undefined,
      categoryExternalID: (propertyType && propertyType !== 'any') ? PROPERTY_TYPE_MAP[propertyType] : undefined,
      roomsMin: bedroomsNum,
      roomsMax: bedroomsNum,
      hitsPerPage: 25,
    };

    // Fetch properties
    const { properties } = await searchProperties(searchParams);

    // Enrich with market data
    const enriched = properties.map((p) => {
      p.marketComparison = calculateMarketComparison(p);
      p.investmentMetrics = calculateInvestmentMetrics(p);
      return p;
    });

    // AI matching
    const preferences = {
      step: 5,
      goal: goal || 'both',
      budgetMin: Number(budgetMin) || 500000,
      budgetMax: Number(budgetMax) || 5000000,
      locationId: locationId || null,
      locationName: locationName || 'Dubai',
      preferredAreas: areas ? String(areas).split(',').slice(0, 20) : [],
      propertyType: propertyType || null,
      bedrooms: bedroomsNum !== undefined ? bedroomsNum : null,
      isComplete: true,
    };

    const matchResults = await matchProperties(enriched, preferences);

    // Merge match results with properties
    const results = matchResults.map((match) => {
      const property = enriched.find((p) => p.id === match.propertyId);
      if (property) {
        property.matchScore = match.finalScore;
        property.matchReasons = match.matchReasons;
      }
      return property;
    }).filter(Boolean);

    return NextResponse.json({
      properties: results,
      total: results.length,
    });
  } catch (error) {
    console.error('AI match error:', error);
    return NextResponse.json(
      { error: 'Failed to match properties' },
      { status: 500 }
    );
  }
}
