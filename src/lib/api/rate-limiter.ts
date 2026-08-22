import { RATE_LIMIT } from '@/lib/constants/api-config';

interface RateLimitState {
  count: number;
  monthKey: string;
}

let state: RateLimitState = {
  count: 0,
  monthKey: getCurrentMonthKey(),
};

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

export function checkRateLimit(): { allowed: boolean; remaining: number } {
  const currentKey = getCurrentMonthKey();

  if (state.monthKey !== currentKey) {
    state = { count: 0, monthKey: currentKey };
  }

  const remaining = RATE_LIMIT.maxRequestsPerMonth - state.count;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
  };
}

export function incrementRateLimit(): void {
  const currentKey = getCurrentMonthKey();
  if (state.monthKey !== currentKey) {
    state = { count: 0, monthKey: currentKey };
  }
  state.count++;
}

export function getRateLimitStatus(): { used: number; remaining: number; limit: number } {
  const { remaining } = checkRateLimit();
  return {
    used: state.count,
    remaining,
    limit: RATE_LIMIT.maxRequestsPerMonth,
  };
}
