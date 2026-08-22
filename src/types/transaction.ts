export interface DLDTransaction {
  id: string;
  transactionDate: string;
  transactionType: 'sale' | 'mortgage' | 'gift' | 'other';
  propertyType: string;
  area: string;
  building?: string;
  transactionValue: number;
  propertySize: number; // sqft
  pricePerSqft: number; // computed
  rooms?: number;
}

export interface DLDTransactionResponse {
  transactions: DLDTransaction[];
  total: number;
  metadata: {
    area: string;
    medianPrice: number;
    medianPricePerSqft: number;
    avgPrice: number;
    avgPricePerSqft: number;
    totalTransactions: number;
    period: string;
    // 'live' = real DLD-registered transactions; 'estimated' = mock/benchmark fallback.
    source: 'live' | 'estimated';
  };
}

export interface PriceHistoryPoint {
  date: string;
  avgPricePerSqft: number;
  transactionCount: number;
}

export interface AreaTrend {
  area: string;
  currentAvgPricePerSqft: number;
  previousAvgPricePerSqft: number;
  yoyChange: number; // percentage
  trend: 'rising' | 'falling' | 'stable';
}
