import { z } from 'zod';
import { AIAnalysisResponse } from '@/types/ai';
import { Property } from '@/types/property';
import { structuredChat } from '@/lib/api/openai';
import { OPENAI_TEXT_MODEL } from '@/lib/constants/api-config';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from './prompts';
import { calculateMarketComparison } from '@/lib/market/comparison';
import { calculateInvestmentMetrics } from '@/lib/market/roi-calculator';

const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommendation: { type: 'string', enum: ['strong-buy', 'buy', 'hold', 'caution'] },
    priceAssessment: { type: 'string' },
    rentalPotential: { type: 'string' },
    longTermOutlook: { type: 'string' },
  },
  required: ['summary', 'strengths', 'risks', 'recommendation', 'priceAssessment', 'rentalPotential', 'longTermOutlook'],
} as const;

const analysisSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  recommendation: z.enum(['strong-buy', 'buy', 'hold', 'caution']),
  priceAssessment: z.string(),
  rentalPotential: z.string(),
  longTermOutlook: z.string(),
});

export async function analyzeProperty(
  property: Property,
  source: 'live' | 'estimated' = 'estimated'
): Promise<AIAnalysisResponse> {
  const comparison = property.marketComparison || calculateMarketComparison(property);
  const metrics = property.investmentMetrics || calculateInvestmentMetrics(property);

  const prompt = buildAnalysisPrompt(
    {
      title: property.title,
      price: property.price,
      pricePerSqft: property.pricePerSqft,
      type: property.type,
      bedrooms: property.bedrooms,
      area: property.area,
      location: property.location.area,
      amenities: property.amenities,
    },
    {
      medianPricePerSqft: comparison.medianPricePerSqft,
      percentageDiff: comparison.percentageDiff,
      trend: comparison.trend,
      recentTransactions: comparison.sampleSize,
      source,
    },
    {
      grossRentalYield: metrics.grossRentalYield,
      netRentalYield: metrics.netRentalYield,
      capitalAppreciation: metrics.capitalAppreciation,
      fiveYearROI: metrics.fiveYearROI,
    }
  );

  const result = await structuredChat<AIAnalysisResponse>({
    label: 'analyze',
    model: OPENAI_TEXT_MODEL,
    system: ANALYSIS_SYSTEM_PROMPT,
    user: prompt,
    schemaName: 'property_analysis',
    jsonSchema: ANALYSIS_JSON_SCHEMA,
    parse: (raw) => {
      const p = analysisSchema.safeParse(raw);
      return p.success ? p.data : null;
    },
    temperature: 0.4,
    maxTokens: 1500,
  });

  return result ?? generateFallbackAnalysis(property, comparison, metrics);
}

function generateFallbackAnalysis(
  property: Property,
  comparison: { percentageDiff: number; trend: string; medianPricePerSqft: number },
  metrics: { grossRentalYield: number; netRentalYield: number; capitalAppreciation: number; fiveYearROI: number }
): AIAnalysisResponse {
  const isGoodDeal = comparison.percentageDiff < -3;
  const isHighYield = metrics.netRentalYield > 6;
  const isRisingArea = comparison.trend === 'rising';

  let recommendation: AIAnalysisResponse['recommendation'] = 'hold';
  if (isGoodDeal && isHighYield && isRisingArea) recommendation = 'strong-buy';
  else if ((isGoodDeal && isRisingArea) || (isHighYield && isRisingArea)) recommendation = 'buy';
  else if (comparison.percentageDiff > 10) recommendation = 'caution';

  return {
    summary: `${property.title} in ${property.location.area} is priced at AED ${property.price.toLocaleString()} (${property.pricePerSqft} AED/sqft), which is ${Math.abs(comparison.percentageDiff).toFixed(1)}% ${comparison.percentageDiff < 0 ? 'below' : 'above'} the area median. ${isRisingArea ? 'The area shows strong upward momentum.' : 'The area market is currently stable.'}`,
    strengths: [
      isGoodDeal ? 'Priced below market median — potential value opportunity' : 'Competitive pricing for the area',
      isHighYield ? `Strong rental yield of ${metrics.netRentalYield.toFixed(1)}%` : `Solid rental potential at ${metrics.netRentalYield.toFixed(1)}% net yield`,
      `${property.location.area} is a ${isRisingArea ? 'high-growth' : 'mature'} community with strong infrastructure`,
    ],
    risks: [
      comparison.percentageDiff > 5 ? 'Priced above area median — limited upside in short term' : 'Market correction risk if macro conditions shift',
      'Service charges may increase in newer developments',
      'Off-plan supply pipeline could add competitive pressure',
    ],
    recommendation,
    priceAssessment: `At ${property.pricePerSqft} AED/sqft, this property is ${Math.abs(comparison.percentageDiff).toFixed(1)}% ${comparison.percentageDiff < 0 ? 'below' : 'above'} the ${property.location.area} median of ${comparison.medianPricePerSqft} AED/sqft. ${isGoodDeal ? 'This represents a potential value entry point.' : 'The pricing is in line with recent transaction data.'}`,
    rentalPotential: `Estimated gross rental yield of ${metrics.grossRentalYield.toFixed(1)}% (${metrics.netRentalYield.toFixed(1)}% net). ${property.location.area} maintains strong rental demand from ${property.bedrooms <= 1 ? 'young professionals and couples' : 'families and long-term residents'}.`,
    longTermOutlook: `With ${metrics.capitalAppreciation.toFixed(1)}% estimated annual appreciation and ${metrics.fiveYearROI.toFixed(1)}% projected 5-year ROI, this property offers ${metrics.fiveYearROI > 50 ? 'excellent' : metrics.fiveYearROI > 30 ? 'good' : 'moderate'} long-term potential. ${isRisingArea ? 'The area trajectory supports continued value growth.' : 'A stable area with predictable returns.'}`,
  };
}
