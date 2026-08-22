import { z } from 'zod';
import { Property } from '@/types/property';
import { AIMatchResult } from '@/types/ai';
import { QuestionnaireState } from '@/types/questionnaire';
import { structuredChat } from '@/lib/api/openai';
import { OPENAI_TEXT_MODEL } from '@/lib/constants/api-config';
import { MATCHING_SYSTEM_PROMPT, buildMatchingPrompt } from './prompts';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Weights for algorithmic scoring
const WEIGHTS = {
  budget: 0.30,
  location: 0.25,
  investment: 0.20,
  type: 0.15,
  bedrooms: 0.10,
};

export function algorithmicScore(
  property: Property,
  prefs: QuestionnaireState
): number {
  let score = 0;

  // Budget fit (30%)
  if (property.price >= prefs.budgetMin && property.price <= prefs.budgetMax) {
    const midBudget = (prefs.budgetMin + prefs.budgetMax) / 2;
    const range = prefs.budgetMax - prefs.budgetMin;
    const deviation = Math.abs(property.price - midBudget) / (range / 2);
    score += WEIGHTS.budget * (1 - deviation * 0.3) * 100;
  } else if (property.price < prefs.budgetMin) {
    const diff = (prefs.budgetMin - property.price) / prefs.budgetMin;
    score += WEIGHTS.budget * Math.max(0, 1 - diff * 2) * 100;
  } else {
    const diff = (property.price - prefs.budgetMax) / prefs.budgetMax;
    score += WEIGHTS.budget * Math.max(0, 1 - diff * 3) * 100;
  }

  // Location match (25%)
  // Preferred areas (explicitly chosen) score highest; work/study location is a secondary signal
  const areaSlug = property.location.slug || '';
  const areaName = property.location.area.toLowerCase();
  if (prefs.preferredAreas.some(a => areaSlug.includes(a) || a.includes(areaSlug) || areaName.includes(a.replace(/-/g, ' ')))) {
    score += WEIGHTS.location * 100;
  } else if (prefs.locationName && areaName.includes(prefs.locationName.toLowerCase())) {
    score += WEIGHTS.location * 60; // Near work/study — convenient but not explicitly preferred
  } else {
    score += WEIGHTS.location * 40; // Baseline for non-matching areas
  }

  // Investment potential (20%)
  const comparison = property.marketComparison;
  if (comparison) {
    if (comparison.percentageDiff < -10) score += WEIGHTS.investment * 100;
    else if (comparison.percentageDiff < -3) score += WEIGHTS.investment * 85;
    else if (comparison.percentageDiff < 3) score += WEIGHTS.investment * 70;
    else if (comparison.percentageDiff < 10) score += WEIGHTS.investment * 50;
    else score += WEIGHTS.investment * 30;
  } else {
    score += WEIGHTS.investment * 50;
  }

  // Type match (15%)
  if (!prefs.propertyType || prefs.propertyType === 'any' || property.type === prefs.propertyType) {
    score += WEIGHTS.type * 100;
  } else {
    score += WEIGHTS.type * 30;
  }

  // Bedroom match (10%)
  if (prefs.bedrooms === null || property.bedrooms === prefs.bedrooms) {
    score += WEIGHTS.bedrooms * 100;
  } else if (Math.abs(property.bedrooms - (prefs.bedrooms || 0)) === 1) {
    score += WEIGHTS.bedrooms * 60;
  } else {
    score += WEIGHTS.bedrooms * 20;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export async function matchProperties(
  properties: Property[],
  prefs: QuestionnaireState
): Promise<AIMatchResult[]> {
  // Phase 1: Algorithmic scoring for all
  const algorithmicResults: AIMatchResult[] = properties.map((p) => {
    const algoScore = algorithmicScore(p, prefs);
    return {
      propertyId: p.id,
      algorithmicScore: algoScore,
      gptScore: null,
      finalScore: algoScore,
      matchReasons: generateAlgorithmicReasons(p, prefs),
      investmentInsight: generateAlgorithmicInsight(p),
    };
  });

  // Sort by algorithmic score
  algorithmicResults.sort((a, b) => b.algorithmicScore - a.algorithmicScore);

  // Phase 2: GPT enhancement for the top 15 only.
  const top15 = algorithmicResults.slice(0, 15);
  const rest = algorithmicResults.slice(15);
  const topProperties = top15
    .map((r) => properties.find((p) => p.id === r.propertyId))
    .filter((p): p is Property => !!p);

  const enhanced = await enhanceWithGPT(topProperties, prefs);
  if (enhanced) {
    let coverage = 0;
    for (const r of top15) {
      const g = enhanced.get(r.propertyId);
      if (!g) continue; // no GPT score → keep the algorithmic finalScore
      coverage += 1;
      r.gptScore = g.score;
      // Blend: 40% transparent baseline + 60% model judgement.
      r.finalScore = Math.round(r.algorithmicScore * 0.4 + g.score * 0.6);
      if (g.reasons.length) r.matchReasons = g.reasons;
      if (g.insight) r.investmentInsight = g.insight;
    }
    console.info(`[ai] match.enhance coverage=${coverage}/${top15.length}`);
  }

  // The AI-refined shortlist ranks on top by blended score; the remainder keeps
  // its algorithmic order below. This avoids mixing two score scales in one sort
  // (an un-enhanced #16 can never leapfrog the blended top 15).
  top15.sort((a, b) => b.finalScore - a.finalScore);
  return [...top15, ...rest];
}

const MATCH_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          propertyId: { type: 'string' },
          score: { type: 'number' },
          reasons: { type: 'array', items: { type: 'string' } },
          insight: { type: 'string' },
        },
        required: ['propertyId', 'score', 'reasons', 'insight'],
      },
    },
  },
  required: ['scores'],
} as const;

const matchScoresSchema = z.object({
  scores: z.array(
    z.object({
      propertyId: z.string(),
      score: z.number(),
      reasons: z.array(z.string()),
      insight: z.string(),
    })
  ),
});

type GptScore = { score: number; reasons: string[]; insight: string };

async function enhanceWithGPT(
  properties: Property[],
  prefs: QuestionnaireState
): Promise<Map<string, GptScore> | null> {
  if (properties.length === 0) return null;

  const validIds = new Set(properties.map((p) => p.id));
  const propertyData = properties.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    pricePerSqft: p.pricePerSqft,
    type: p.type,
    bedrooms: p.bedrooms,
    area: p.area,
    location: p.location.area,
    marketComparison: p.marketComparison
      ? { percentageDiff: p.marketComparison.percentageDiff, trend: p.marketComparison.trend }
      : undefined,
  }));

  const prompt = buildMatchingPrompt(
    {
      goal: prefs.goal || 'both',
      budgetMin: prefs.budgetMin,
      budgetMax: prefs.budgetMax,
      locationName: prefs.locationName || 'Dubai',
      preferredAreas: prefs.preferredAreas,
      propertyType: prefs.propertyType || 'any',
      bedrooms: prefs.bedrooms,
    },
    propertyData
  );

  const result = await structuredChat({
    label: 'match.enhance',
    model: OPENAI_TEXT_MODEL,
    system: MATCHING_SYSTEM_PROMPT,
    user: prompt,
    schemaName: 'match_scores',
    jsonSchema: MATCH_JSON_SCHEMA,
    parse: (raw) => {
      const p = matchScoresSchema.safeParse(raw);
      return p.success ? p.data : null;
    },
    temperature: 0.2,
    maxTokens: 2000,
  });

  if (!result) return null;

  const map = new Map<string, GptScore>();
  let hallucinated = 0;
  for (const s of result.scores) {
    if (!validIds.has(s.propertyId)) {
      hallucinated += 1; // model returned an ID not in the candidate set — drop it
      continue;
    }
    map.set(s.propertyId, {
      score: clamp(Math.round(s.score), 0, 100),
      reasons: s.reasons.slice(0, 3),
      insight: s.insight,
    });
  }
  if (hallucinated) console.warn(`[ai] match.enhance dropped ${hallucinated} unknown propertyId(s)`);
  return map;
}

function generateAlgorithmicReasons(property: Property, prefs: QuestionnaireState): string[] {
  const reasons: string[] = [];

  if (property.price >= prefs.budgetMin && property.price <= prefs.budgetMax) {
    reasons.push('Within your budget range');
  }

  if (property.marketComparison) {
    if (property.marketComparison.percentageDiff < -5) {
      reasons.push(`${Math.abs(property.marketComparison.percentageDiff).toFixed(0)}% below area median — potential value`);
    } else if (property.marketComparison.percentageDiff < 3) {
      reasons.push('Priced at market value');
    }
  }

  if (prefs.propertyType && property.type === prefs.propertyType) {
    reasons.push(`Matches your ${property.type} preference`);
  }

  if (prefs.bedrooms !== null && property.bedrooms === prefs.bedrooms) {
    reasons.push(`${property.bedrooms === 0 ? 'Studio' : `${property.bedrooms}BR`} — exactly what you want`);
  }

  if (property.location.area && prefs.preferredAreas.length > 0) {
    reasons.push(`Located in ${property.location.area}`);
  }

  return reasons.slice(0, 3);
}

function generateAlgorithmicInsight(property: Property): string {
  if (property.marketComparison && property.marketComparison.percentageDiff < -8) {
    return `Priced ${Math.abs(property.marketComparison.percentageDiff).toFixed(0)}% below market — strong buying opportunity in ${property.location.area}.`;
  }
  if (property.investmentMetrics && property.investmentMetrics.netRentalYield > 7) {
    return `High rental yield of ${property.investmentMetrics.netRentalYield.toFixed(1)}% — excellent for income investors.`;
  }
  return `Solid option in ${property.location.area} with strong market fundamentals.`;
}
