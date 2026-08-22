import { NextRequest, NextResponse } from 'next/server';

/*
 * Best-effort in-memory fixed-window rate limiter.
 * NOTE: state is per-process. On a single long-running server (`next start`)
 * this is effective; on multi-instance serverless it only limits per instance.
 * For production-grade global limits, back this with Upstash/Redis — the call
 * sites below stay the same, only `hit()` changes.
 */

type Window = { count: number; resetAt: number };
const store = new Map<string, Window>();

// Opportunistic cleanup so the map can't grow unbounded.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, w] of store) if (w.resetAt <= now) store.delete(k);
}

export function hit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const w = store.get(key);
  if (!w || w.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (w.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((w.resetAt - now) / 1000) };
  }
  w.count += 1;
  return { ok: true, remaining: limit - w.count, retryAfter: 0 };
}

export function getClientIp(req: NextRequest): string {
  // The LEFTMOST X-Forwarded-For entry is fully client-controlled (a proxy
  // appends the real hop on the right), so keying on it lets an attacker rotate
  // it to get a fresh bucket per request. Prefer platform-set headers, and if we
  // must fall back to XFF, use the RIGHTMOST hop (added by the trusted proxy).
  const platform = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-real-ip');
  if (platform) return platform.trim();

  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const hops = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return 'unknown';
}

/**
 * Enforce a limit for `name` scoped to the caller's IP.
 * Returns a 429 NextResponse when exceeded, otherwise null (proceed).
 */
export function enforceRateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(req);
  const { ok, retryAfter } = hit(`${name}:${ip}`, limit, windowMs);
  if (ok) return null;
  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
