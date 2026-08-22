'use client';

import { useQuery } from '@tanstack/react-query';
import { Property } from '@/types/property';
import { GoalType, PropertyTypePreference } from '@/types/questionnaire';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { getMockTransactionsForArea, getMockPriceHistory } from '@/data/mock-transactions';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';
import { algorithmicScore } from '@/lib/ai/matching';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

interface SearchResult {
  properties: Property[];
  total: number;
}

function mockSearch(params: Record<string, string>): SearchResult {
  let filtered = [...MOCK_PROPERTIES];

  const budgetMin = Number(params.budgetMin) || 0;
  const budgetMax = Number(params.budgetMax) || Infinity;
  if (budgetMin) filtered = filtered.filter((p) => p.price >= budgetMin);
  if (budgetMax < Infinity) filtered = filtered.filter((p) => p.price <= budgetMax);

  const bedrooms = params.bedrooms;
  if (bedrooms && bedrooms !== '' && bedrooms !== 'any') {
    const br = Number(bedrooms);
    filtered = filtered.filter((p) => p.bedrooms === br);
  }

  if (params.propertyType && params.propertyType !== 'any') {
    filtered = filtered.filter((p) => p.type === params.propertyType);
  }

  // Match the live Bayut path, which hard-filters by chosen area (location id).
  const areaSlugs = params.areas ? params.areas.split(',').filter(Boolean) : [];
  if (areaSlugs.length > 0) {
    filtered = filtered.filter((p) => areaSlugs.includes(p.location.slug || ''));
  }

  // Enrich
  const enriched = filtered.map((p) => {
    p.marketComparison = calculateMarketComparison(p);
    p.investmentMetrics = calculateInvestmentMetrics(p);
    return p;
  });

  // Score
  const prefs = {
    step: 5,
    goal: (params.goal || 'both') as GoalType,
    budgetMin,
    budgetMax,
    locationId: params.locationId || null,
    locationName: params.locationName || 'Dubai',
    preferredAreas: params.areas ? params.areas.split(',') : [],
    propertyType: (params.propertyType || null) as PropertyTypePreference | null,
    bedrooms: bedrooms && bedrooms !== '' && bedrooms !== 'any' ? Number(bedrooms) : null,
    isComplete: true,
  };

  const scored = enriched.map((p) => {
    p.matchScore = algorithmicScore(p, prefs);
    p.matchReasons = [`Located in ${p.location.area}`, 'Within your budget range'];
    return p;
  });

  scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return { properties: scored, total: scored.length };
}

function mockPropertyDetail(id: string) {
  const property = MOCK_PROPERTIES.find((p) => p.id === id);
  if (!property) return null;
  property.marketComparison = calculateMarketComparison(property);
  property.investmentMetrics = calculateInvestmentMetrics(property);
  const transactions = getMockTransactionsForArea(property.location.area);
  return { property, transactions, marketMetadata: {} };
}

export function usePropertySearch(params: Record<string, string> | null) {
  return useQuery<SearchResult>({
    queryKey: ['properties', params],
    queryFn: async () => {
      if (isMock) return mockSearch(params!);
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    },
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePropertyDetail(id: string | null) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (isMock) return mockPropertyDetail(id!);
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      return res.json();
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTransactions(area: string | null, includePriceHistory = false) {
  return useQuery({
    queryKey: ['transactions', area, includePriceHistory],
    queryFn: async () => {
      if (isMock) {
        const transactions = getMockTransactionsForArea(area!);
        return {
          transactions,
          total: transactions.length,
          priceHistory: includePriceHistory ? getMockPriceHistory(area!) : undefined,
        };
      }
      const params = new URLSearchParams({ area: area! });
      if (includePriceHistory) params.set('priceHistory', 'true');
      const res = await fetch(`/api/transactions/dld?${params}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
    enabled: !!area,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAIAnalysis(propertyId: string | null) {
  return useQuery({
    queryKey: ['analysis', propertyId],
    queryFn: async () => {
      if (isMock) {
        return {
          summary: 'This property offers strong value in a prime Dubai location with healthy rental yields and solid capital appreciation potential.',
          strengths: ['Prime location with strong rental demand', 'Below-market pricing per sqft', 'Established community with full amenities'],
          risks: ['Market cyclicality in luxury segment', 'Service charge increases', 'Potential oversupply in area'],
          recommendation: 'buy',
          priceAssessment: 'Competitively priced relative to area comparables.',
          rentalPotential: 'Strong rental demand from professionals and tourists.',
          longTermOutlook: 'Positive 5-year trajectory supported by infrastructure development.',
        };
      }
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (!res.ok) throw new Error('Failed to analyze');
      return res.json();
    },
    enabled: !!propertyId,
    staleTime: 30 * 60 * 1000,
  });
}
