import OpenAI from 'openai';
import { OPENAI_VISION_MODEL, OPENAI_IMAGE_MODEL } from '@/lib/constants/api-config';

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  // Built-in retry/backoff for transient 429/5xx; hard per-request timeout.
  client = new OpenAI({ apiKey, maxRetries: 2, timeout: 30_000 });
  return client;
}

// Lightweight observability: model, token usage, and latency per call.
function logUsage(label: string, model: string, usage: OpenAI.CompletionUsage | undefined, startedAt: number) {
  console.info(
    `[ai] ${label} model=${model} prompt_tokens=${usage?.prompt_tokens ?? '?'} ` +
      `completion_tokens=${usage?.completion_tokens ?? '?'} latency_ms=${Date.now() - startedAt}`
  );
}

type UserContent = OpenAI.Chat.Completions.ChatCompletionUserMessageParam['content'];

/**
 * Schema-enforced chat completion. Uses OpenAI Structured Outputs
 * (response_format json_schema, strict) so the model can only return the shape
 * we asked for, then validates/normalises the payload with `parse` (a zod-backed
 * guard at the call site). Returns null on missing key, API error, or a payload
 * that fails validation — callers degrade gracefully.
 */
export async function structuredChat<T>(opts: {
  label: string;
  model: string;
  system: string;
  user: UserContent;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  parse: (raw: unknown) => T | null;
  temperature?: number;
  maxTokens?: number;
  seed?: number;
}): Promise<T | null> {
  const openai = getClient();
  if (!openai) return null;

  const startedAt = Date.now();
  try {
    const response = await openai.chat.completions.create({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 1500,
      seed: opts.seed ?? 7, // reproducible demos
      response_format: {
        type: 'json_schema',
        json_schema: { name: opts.schemaName, strict: true, schema: opts.jsonSchema },
      },
    });
    logUsage(opts.label, opts.model, response.usage, startedAt);

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      console.error(`[ai] ${opts.label}: model returned invalid JSON`);
      return null;
    }
    return opts.parse(raw);
  } catch (error) {
    console.error(`[ai] ${opts.label} failed:`, error);
    return null;
  }
}

export interface FloorPlanResult {
  description: string;
  rooms: { name: string; url: string }[];
}

/** Thrown when gpt-image-1 rejects because the OpenAI org isn't verified. */
export class ImageModelUnverifiedError extends Error {
  code = 'IMAGE_MODEL_UNVERIFIED' as const;
}

const ROOMS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    rooms: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { name: { type: 'string' }, description: { type: 'string' } },
        required: ['name', 'description'],
      },
    },
  },
  required: ['rooms'],
} as const;

function looksLikeVerificationError(reason: unknown): boolean {
  const msg = String(reason).toLowerCase();
  return msg.includes('must be verified') || msg.includes('verify organization') || msg.includes('not verified');
}

export async function generateFloorPlanImages(
  floorPlanUrl: string,
  context: { bedrooms: number; area: number; type: string; title: string }
): Promise<FloorPlanResult> {
  const openai = getClient();
  if (!openai) throw new Error('OpenAI not configured');

  const bedroomLabel = context.bedrooms === 0 ? 'studio' : `${context.bedrooms}-bedroom`;

  // Step 1 — vision analysis of the floor plan, schema-enforced.
  const analysis = await structuredChat<{ rooms: { name: string; description: string }[] }>({
    label: 'floorplan.vision',
    model: OPENAI_VISION_MODEL,
    system:
      'You are an interior design AI. Given a floor plan image, identify exactly 4 main rooms and describe each in detail.',
    user: [
      { type: 'image_url', image_url: { url: floorPlanUrl, detail: 'high' } },
      {
        type: 'text',
        text: `Analyze this floor plan of a ${bedroomLabel} ${context.type} (${context.area.toLocaleString()} sqft). Identify exactly 4 main rooms. For each: "name" (e.g. "Living Room", "Master Bedroom", "Kitchen", "Bathroom") and "description" (2-3 sentences on shape, relative size, windows, doors, and features like balcony access, en-suite, island counter, walk-in closet).`,
      },
    ],
    schemaName: 'floor_plan_rooms',
    jsonSchema: ROOMS_SCHEMA,
    parse: (raw) => (raw && typeof raw === 'object' && Array.isArray((raw as { rooms?: unknown }).rooms) ? (raw as { rooms: { name: string; description: string }[] }) : null),
    temperature: 0.3,
    maxTokens: 600,
  });

  const rooms = (analysis?.rooms?.length
    ? analysis.rooms
    : [
        { name: 'Living Room', description: `Open-plan living area of a ${bedroomLabel} ${context.type}.` },
        { name: 'Master Bedroom', description: 'Spacious master bedroom with natural light.' },
        { name: 'Kitchen', description: 'Modern kitchen with counter space.' },
        { name: 'Bathroom', description: 'Full bathroom with modern fixtures.' },
      ]
  ).slice(0, 4);

  // Step 2 — one image per room, consistent style, generated in parallel.
  const results = await Promise.allSettled(
    rooms.map(async (room) => {
      const response = await openai.images.generate({
        model: OPENAI_IMAGE_MODEL,
        prompt: `Photorealistic interior photo of the ${room.name.toLowerCase()} in a ${bedroomLabel} Dubai apartment. ${room.description} Style: simple, modern, clean — white walls, light wood floors, minimal furniture, neutral tones with subtle warm accents. Natural daylight from floor-to-ceiling windows. Wide-angle, architectural photography, magazine quality.`,
        n: 1,
        size: '1024x1024',
        quality: 'low',
      });
      const b64 = response.data?.[0]?.b64_json;
      const url = b64 ? `data:image/png;base64,${b64}` : response.data?.[0]?.url || '';
      return { name: room.name, url };
    })
  );

  const images: { name: string; url: string }[] = [];
  const errors: unknown[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.url) images.push(r.value);
    else if (r.status === 'rejected') errors.push(r.reason);
  }

  if (images.length === 0) {
    console.error('All image generation attempts failed:', errors.map(String));
    if (errors.some(looksLikeVerificationError)) {
      throw new ImageModelUnverifiedError('Image model requires a verified OpenAI organization');
    }
    throw new Error('All image generation attempts failed');
  }

  return {
    description: `AI-generated room renderings based on the floor plan of this ${bedroomLabel} ${context.type}.`,
    rooms: images,
  };
}
