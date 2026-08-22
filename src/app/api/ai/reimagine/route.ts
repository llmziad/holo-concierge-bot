import { NextRequest, NextResponse } from 'next/server';
import { generateFloorPlanImages, ImageModelUnverifiedError } from '@/lib/api/openai';
import { enforceRateLimit } from '@/lib/api/rate-limit';

// Allow up to 60s for image generation (Vercel Hobby max)
export const maxDuration = 60;

// Floor plans only ever come from Bayut — allowlist those hosts to prevent
// the URL being used as an SSRF/relay or to fetch oversized payloads.
function isAllowedFloorPlanUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:') return false;
    const h = url.hostname;
    return h === 'images.bayut.com' || h.endsWith('.bayut.com') || h === 'bayut-production.s3.eu-central-1.amazonaws.com';
  } catch {
    return false;
  }
}

const clampInt = (v: unknown, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.floor(Number(v) || 0)));

export async function POST(req: NextRequest) {
  // Strict cap: this endpoint fans out to ~5 paid OpenAI calls per request.
  const limited = enforceRateLimit(req, 'reimagine', 5, 5 * 60 * 1000);
  if (limited) return limited;

  try {
    if (Number(req.headers.get('content-length') || 0) > 10_000) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const body = await req.json();
    const { floorPlanUrl, bedrooms, area, propertyType, title } = body ?? {};

    if (typeof floorPlanUrl !== 'string' || !isAllowedFloorPlanUrl(floorPlanUrl)) {
      return NextResponse.json({ error: 'A valid Bayut floor plan URL is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Image generation is not available right now' }, { status: 503 });
    }

    const result = await generateFloorPlanImages(floorPlanUrl, {
      bedrooms: clampInt(bedrooms, 0, 20),
      area: clampInt(area, 0, 1_000_000),
      type: typeof propertyType === 'string' ? propertyType.slice(0, 40) : 'apartment',
      title: typeof title === 'string' ? title.slice(0, 120) : 'Property',
    });

    return NextResponse.json(result);
  } catch (error) {
    // Log detail server-side; never leak upstream provider internals to the client.
    console.error('Floor plan reimagine error:', error);
    if (error instanceof ImageModelUnverifiedError) {
      return NextResponse.json(
        { error: 'Image generation is not enabled for this deployment yet.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Could not generate the reimagined rooms. Please try again.' },
      { status: 500 }
    );
  }
}
