import { BAYUT_API_BASE, BAYUT_HEADERS, isMockMode } from '@/lib/constants/api-config';
import { Property, PropertySearchParams } from '@/types/property';
import { checkRateLimit, incrementRateLimit } from './rate-limiter';
import { MOCK_PROPERTIES } from '@/data/mock-properties';

// Map our property type to Bayut category slugs
const CATEGORY_SLUGS: Record<string, string> = {
  '4': 'apartments',
  '3': 'villas',
  '16': 'townhouses',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformNewApiHit(hit: Record<string, any>): Property {
  const price = hit.price || 0;
  // area can be a number or an object { built_up, plot, unit }
  const sqft = typeof hit.area === 'object'
    ? Math.round(Number(hit.area?.built_up || 0))
    : (hit.area ? Math.round(Number(hit.area)) : 0);
  const areaName = hit.location?.community?.name || hit.location?.area_name || 'Dubai';
  const areaSlug = hit.location?.community?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') || '';
  const buildingName = hit.location?.sub_community?.name || hit.location?.cluster?.name || undefined;

  // Type from nested type object or string
  const typeStr = typeof hit.type === 'object' ? (hit.type?.sub || hit.type?.main || '') : String(hit.type || hit.category || '');

  return {
    id: String(hit.id || Math.random()),
    title: hit.title || hit.name || 'Untitled Property',
    description: hit.description || '',
    price,
    pricePerSqft: sqft > 0 ? Math.round(price / sqft) : 0,
    currency: 'AED',
    type: mapType(typeStr),
    bedrooms: Number(hit.details?.bedrooms ?? hit.rooms ?? 0),
    bathrooms: Number(hit.details?.bathrooms ?? hit.baths ?? 0),
    area: sqft,
    location: {
      area: areaName,
      building: buildingName,
      city: 'Dubai',
      lat: hit.location?.coordinates?.lat,
      lng: hit.location?.coordinates?.lng,
      slug: areaSlug,
    },
    images: extractImages(hit),
    amenities: extractAmenities(hit),
    agent: {
      name: hit.agent?.name || 'Agent',
      company: hit.agency?.name || 'Agency',
      avatar: hit.agent?.profile_image || hit.agency?.logo_url,
    },
    purpose: String(hit.purpose || 'for-sale').includes('rent') ? 'for-rent' : 'for-sale',
    furnishing: hit.details?.is_furnished ? 'Furnished' : 'Unfurnished',
    completionStatus: hit.details?.completion_status || 'ready',
    addedOn: hit.verification?.verified_at
      ? hit.verification.verified_at.split(' ')[0]
      : '',
    floorPlan: hit.floor_plan?.['2d_images']?.length > 0
      ? {
          images2d: hit.floor_plan['2d_images'],
          images3d: hit.floor_plan['3d_images'] || [],
          models: hit.floor_plan['models'] || [],
        }
      : undefined,
  };
}

function mapType(cat: string): Property['type'] {
  const s = String(cat).toLowerCase();
  if (s.includes('villa')) return 'villa';
  if (s.includes('townhouse')) return 'townhouse';
  if (s.includes('penthouse')) return 'penthouse';
  if (s.includes('duplex')) return 'duplex';
  if (s.includes('land') || s.includes('plot')) return 'land';
  return 'apartment';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImages(hit: Record<string, any>): string[] {
  // New API: media.photos is an array of URLs
  if (hit.media?.photos && Array.isArray(hit.media.photos)) {
    return hit.media.photos.filter(Boolean);
  }
  if (hit.media?.cover_photo) return [String(hit.media.cover_photo)];
  // Legacy fallbacks
  if (hit.photos && Array.isArray(hit.photos)) {
    return hit.photos.map((p: Record<string, string>) => String(p.url || p.image || p)).filter(Boolean);
  }
  if (hit.cover_photo) return [String(hit.cover_photo)];
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAmenities(hit: Record<string, any>): string[] {
  if (hit.amenities && Array.isArray(hit.amenities)) {
    return hit.amenities.map((a: string | { text: string }) => typeof a === 'string' ? a : a.text).filter(Boolean);
  }
  return [];
}

export async function searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
  if (isMockMode()) {
    return filterMockProperties(params);
  }

  const { allowed } = checkRateLimit();
  if (!allowed) {
    console.warn('Rate limit reached, falling back to mock data');
    return filterMockProperties(params);
  }

  try {
    // Build the new API request body
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {
      purpose: params.purpose || 'for-sale',
    };

    if (params.locationExternalIDs) {
      body.locations_ids = params.locationExternalIDs.split(',').map(Number).filter(Boolean);
    }
    if (params.categoryExternalID && CATEGORY_SLUGS[params.categoryExternalID]) {
      body.categories = [CATEGORY_SLUGS[params.categoryExternalID]];
    }
    if (params.priceMin) body.price_min = params.priceMin;
    if (params.priceMax) body.price_max = params.priceMax;
    if (params.roomsMin !== undefined) body.rooms = [String(params.roomsMin)];

    const page = (params.page || 1) - 1;

    const response = await fetch(
      `${BAYUT_API_BASE}/properties_search?page=${page}&langs=en`,
      {
        method: 'POST',
        headers: BAYUT_HEADERS,
        body: JSON.stringify(body),
      }
    );

    incrementRateLimit();

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`Bayut API error: ${response.status} — ${errorText.slice(0, 200)}`);
      return filterMockProperties(params);
    }

    const data = await response.json();

    // The new API response structure
    const hits = data.results || data.hits || data.properties || data.data || [];
    const properties = Array.isArray(hits) ? hits.map(transformNewApiHit) : [];

    return {
      properties,
      total: data.total || data.nbHits || data.count || properties.length,
    };
  } catch (error) {
    console.error('Bayut API error:', error);
    return filterMockProperties(params);
  }
}

export async function getPropertyDetail(id: string): Promise<Property | null> {
  if (isMockMode() || id.startsWith('mock-')) {
    return MOCK_PROPERTIES.find((p) => p.id === id) || null;
  }

  const { allowed } = checkRateLimit();
  if (!allowed) {
    return MOCK_PROPERTIES.find((p) => p.id === id) || null;
  }

  try {
    const response = await fetch(
      `${BAYUT_API_BASE}/property/${encodeURIComponent(id)}?langs=en`,
      { headers: BAYUT_HEADERS }
    );

    incrementRateLimit();

    if (!response.ok) {
      return MOCK_PROPERTIES.find((p) => p.id === id) || null;
    }

    const hit = await response.json();
    return transformNewApiHit(hit);
  } catch (error) {
    console.error('Bayut detail error:', error);
    return MOCK_PROPERTIES.find((p) => p.id === id) || null;
  }
}

export async function searchLocations(query: string): Promise<Array<{ id: string; name: string; slug: string; externalID: string; hierarchy: string }>> {
  if (isMockMode() || !query || query.length < 2) {
    return [];
  }

  const { allowed } = checkRateLimit();
  if (!allowed) return [];

  try {
    const response = await fetch(
      `${BAYUT_API_BASE}/locations_search?query=${encodeURIComponent(query)}&page=0&langs=en`,
      { headers: BAYUT_HEADERS }
    );

    incrementRateLimit();

    if (!response.ok) return [];

    const data = await response.json();
    const results = data.results || data.hits || data.data || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((hit: Record<string, any>) => {
      // Build hierarchy from the `full` object (new API structure)
      let hierarchy = String(hit.name || '');
      if (hit.full) {
        const parts: string[] = [];
        if (hit.full.country?.name) parts.push(hit.full.country.name);
        if (hit.full.city?.name) parts.push(hit.full.city.name);
        if (hit.full.community?.name && hit.full.community.name !== hit.name) parts.push(hit.full.community.name);
        if (hit.full.sub_community?.name) parts.push(hit.full.sub_community.name);
        if (parts.length > 0) hierarchy = parts.join(' > ');
      }
      return {
        id: String(hit.id || ''),
        name: String(hit.name || ''),
        slug: String(hit.slug || ''),
        externalID: String(hit.id || ''),
        hierarchy,
      };
    });
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

function filterMockProperties(params: PropertySearchParams): { properties: Property[]; total: number } {
  let filtered = [...MOCK_PROPERTIES];

  if (params.priceMin) filtered = filtered.filter((p) => p.price >= params.priceMin!);
  if (params.priceMax) filtered = filtered.filter((p) => p.price <= params.priceMax!);
  if (params.roomsMin !== undefined) filtered = filtered.filter((p) => p.bedrooms >= params.roomsMin!);
  if (params.roomsMax !== undefined) filtered = filtered.filter((p) => p.bedrooms <= params.roomsMax!);

  if (params.categoryExternalID) {
    const typeMap: Record<string, string[]> = {
      '4': ['apartment', 'penthouse', 'duplex'],
      '3': ['villa'],
      '16': ['townhouse'],
    };
    const types = typeMap[params.categoryExternalID] || [];
    if (types.length > 0) {
      filtered = filtered.filter((p) => types.includes(p.type));
    }
  }

  return {
    properties: filtered,
    total: filtered.length,
  };
}
