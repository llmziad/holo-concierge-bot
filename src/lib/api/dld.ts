import { BAYUT_TX_BASE, BAYUT_TX_HEADERS, hasRapidKey, forceMock } from '@/lib/constants/api-config';
import { DLDTransaction, DLDTransactionResponse, PriceHistoryPoint } from '@/types/transaction';
import { MOCK_TRANSACTIONS, getMockPriceHistory } from '@/data/mock-transactions';
import { DUBAI_AREAS } from '@/lib/constants/dubai-areas';

/*
 * Real DLD-registered transactions via the BayutAPI "transactions" endpoint
 * (RapidAPI host uae-real-estate3). Requires the account to be subscribed to
 * that API; the existing RAPIDAPI_KEY is reused. Any failure (not subscribed,
 * rate-limited, network) falls back to mock data flagged as `source: 'estimated'`.
 */

type TimePeriod = '1m' | '3m' | '6m' | '12m' | '24m';

const PERIOD_LABEL: Record<TimePeriod, string> = {
  '1m': 'Last month',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
  '12m': 'Last 12 months',
  '24m': 'Last 24 months',
};

// Resolve an area name (e.g. "Dubai Marina") to a Bayut location id.
function resolveLocationId(area: string): string | null {
  const a = area.trim().toLowerCase();
  const hit =
    DUBAI_AREAS.find((x) => x.name.toLowerCase() === a) ||
    DUBAI_AREAS.find((x) => a.includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(a));
  return hit?.externalID || null;
}

// The transactions payload is Bayut-aggregated; field names vary, so map defensively.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(t: Record<string, any>, fallbackArea: string): DLDTransaction {
  const value = Number(t.price ?? t.amount ?? t.actual_worth ?? t.transaction_value ?? t.worth ?? 0);
  const sizeRaw = t.area ?? t.size ?? t.built_up_area ?? t.procedure_area ?? t.property_size;
  const size = typeof sizeRaw === 'object' ? Number(sizeRaw?.built_up ?? sizeRaw?.value ?? 0) : Number(sizeRaw ?? 0);
  const dateRaw = t.date ?? t.transaction_date ?? t.instance_date ?? t.registered_at ?? t.createdAt ?? '';
  const groupRaw = String(t.transaction_type ?? t.trans_group ?? t.procedure ?? t.type ?? 'sale').toLowerCase();
  const type: DLDTransaction['transactionType'] = groupRaw.includes('mortgage')
    ? 'mortgage'
    : groupRaw.includes('gift')
    ? 'gift'
    : groupRaw.includes('sale') || groupRaw.includes('sell')
    ? 'sale'
    : 'other';

  const roomsRaw = t.rooms ?? t.bedrooms ?? t.beds;

  return {
    id: String(t.id ?? t.transaction_id ?? `${dateRaw}-${value}`),
    transactionDate: String(dateRaw).split('T')[0].split(' ')[0],
    transactionType: type,
    propertyType: String(t.property_type ?? t.type?.main ?? t.category ?? ''),
    area: String(t.area_name ?? t.location?.community?.name ?? t.community ?? fallbackArea),
    building: t.building_name ?? t.location?.sub_community?.name ?? undefined,
    transactionValue: value,
    propertySize: Math.round(size),
    pricePerSqft:
      Number(t.price_per_sqft ?? t.meter_sale_price) > 0
        ? Math.round(Number(t.price_per_sqft ?? t.meter_sale_price))
        : size > 0
        ? Math.round(value / size)
        : 0,
    rooms: roomsRaw != null && roomsRaw !== '' ? Number(String(roomsRaw).replace(/[^\d.]/g, '')) || undefined : undefined,
  };
}

async function fetchBayutTransactions(area: string, period: TimePeriod): Promise<DLDTransaction[]> {
  const params = new URLSearchParams({ time_period: period, langs: 'en' });
  const locId = resolveLocationId(area);
  if (locId) params.set('location_ids', locId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BAYUT_TX_BASE}/transactions?${params}`, {
      headers: BAYUT_TX_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`transactions ${res.status}`);
    }
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = data.results || data.transactions || data.hits || data.data || [];
    let mapped = Array.isArray(rows) ? rows.map((r) => mapTransaction(r, area)) : [];
    // Safety net: if the API couldn't filter by area, filter client-side.
    if (locId == null) {
      const a = area.toLowerCase();
      mapped = mapped.filter((t) => t.area.toLowerCase().includes(a));
    }
    return mapped.filter((t) => t.transactionValue > 0);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getTransactions(
  area: string,
  propertyType?: string,
  months: number = 12
): Promise<DLDTransactionResponse> {
  const period = (['1m', '3m', '6m', '12m', '24m'].includes(`${months}m`) ? `${months}m` : '12m') as TimePeriod;

  if (forceMock() || !hasRapidKey()) {
    return buildMockResponse(area, propertyType, period);
  }

  try {
    let transactions = await fetchBayutTransactions(area, period);
    if (propertyType) {
      transactions = transactions.filter((t) =>
        t.propertyType.toLowerCase().includes(propertyType.toLowerCase())
      );
    }
    if (transactions.length === 0) {
      return buildMockResponse(area, propertyType, period);
    }
    return buildResponse(transactions, area, PERIOD_LABEL[period], 'live');
  } catch (error) {
    console.warn(`DLD transactions unavailable (${(error as Error).message}); using estimates.`);
    return buildMockResponse(area, propertyType, period);
  }
}

export async function getPriceHistory(area: string): Promise<PriceHistoryPoint[]> {
  if (forceMock() || !hasRapidKey()) {
    return getMockPriceHistory(area);
  }
  try {
    const transactions = await fetchBayutTransactions(area, '24m');
    if (transactions.length < 6) return getMockPriceHistory(area);
    return aggregateByMonth(transactions);
  } catch {
    return getMockPriceHistory(area);
  }
}

// Group sale transactions into monthly average price-per-sqft points.
function aggregateByMonth(transactions: DLDTransaction[]): PriceHistoryPoint[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const t of transactions) {
    if (t.pricePerSqft <= 0 || !t.transactionDate) continue;
    const month = t.transactionDate.slice(0, 7); // YYYY-MM
    const b = buckets.get(month) || { sum: 0, count: 0 };
    b.sum += t.pricePerSqft;
    b.count += 1;
    buckets.set(month, b);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({
      date,
      avgPricePerSqft: Math.round(b.sum / b.count),
      transactionCount: b.count,
    }));
}

function buildMockResponse(area: string, propertyType: string | undefined, period: TimePeriod): DLDTransactionResponse {
  let transactions = MOCK_TRANSACTIONS.filter((t) => t.area.toLowerCase().includes(area.toLowerCase()));
  if (propertyType) {
    transactions = transactions.filter((t) => t.propertyType.toLowerCase() === propertyType.toLowerCase());
  }
  return buildResponse(transactions, area, PERIOD_LABEL[period], 'estimated');
}

function buildResponse(
  transactions: DLDTransaction[],
  area: string,
  period: string,
  source: 'live' | 'estimated'
): DLDTransactionResponse {
  const prices = transactions.map((t) => t.transactionValue).filter((v) => v > 0);
  const priceSqft = transactions.map((t) => t.pricePerSqft).filter((v) => v > 0);

  const median = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
  };
  const avg = (arr: number[]) => (arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length));

  return {
    transactions,
    total: transactions.length,
    metadata: {
      area,
      medianPrice: median(prices),
      medianPricePerSqft: median(priceSqft),
      avgPrice: avg(prices),
      avgPricePerSqft: avg(priceSqft),
      totalTransactions: transactions.length,
      period,
      source,
    },
  };
}
