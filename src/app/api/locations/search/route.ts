import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/api/bayut';
import { DUBAI_AREAS } from '@/lib/constants/dubai-areas';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') || '';

    if (!query || query.length < 2) {
      // Return popular areas as defaults
      const defaults = DUBAI_AREAS.filter((a) => a.popular).map((a) => ({
        id: a.externalID,
        name: a.name,
        slug: a.slug,
        externalID: a.externalID,
        hierarchy: `Dubai > ${a.name}`,
      }));
      return NextResponse.json(defaults);
    }

    const results = await searchLocations(query);

    if (results.length === 0) {
      // Fallback to local area matching
      const localResults = DUBAI_AREAS
        .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
        .map((a) => ({
          id: a.externalID,
          name: a.name,
          slug: a.slug,
          externalID: a.externalID,
          hierarchy: `Dubai > ${a.name}`,
        }));
      return NextResponse.json(localResults);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
