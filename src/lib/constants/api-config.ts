export const BAYUT_API_BASE = 'https://uae-real-estate2.p.rapidapi.com';
export const BAYUT_HEADERS = {
  'x-rapidapi-host': 'uae-real-estate2.p.rapidapi.com',
  'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
  'Content-Type': 'application/json',
};

// DLD-registered transactions are served by the BayutAPI "transactions" API,
// which lives on a sibling RapidAPI host (…3, not …2). The same RAPIDAPI_KEY
// works once the account is subscribed to that API on RapidAPI (free tier).
export const BAYUT_TX_HOST = 'uae-real-estate3.p.rapidapi.com';
export const BAYUT_TX_BASE = `https://${BAYUT_TX_HOST}`;
export const BAYUT_TX_HEADERS = {
  'x-rapidapi-host': BAYUT_TX_HOST,
  'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
  'Content-Type': 'application/json',
};

// True only when a real transactions source can be attempted.
export const hasRapidKey = (): boolean => !!process.env.RAPIDAPI_KEY;
export const forceMock = (): boolean => process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/*
 * Model tiering — deliberate quality/cost choices, all env-overridable.
 * Text + vision default to a flagship multimodal model for the "intelligence"
 * features; set OPENAI_MODEL to a newer flagship as it ships, or to
 * 'gpt-4o-mini' to optimise for cost. Structured Outputs (json_schema) require
 * a model that supports them (gpt-4o family and newer).
 */
export const OPENAI_TEXT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
export const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o';
export const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

// Back-compat alias (some modules import OPENAI_MODEL).
export const OPENAI_MODEL = OPENAI_TEXT_MODEL;

export const RATE_LIMIT = {
  maxRequestsPerMonth: 750,
  storageKey: 'bayut_api_usage',
};

export const isMockMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  }
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !process.env.RAPIDAPI_KEY;
};
