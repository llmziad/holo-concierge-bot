import { DLDTransaction, PriceHistoryPoint } from '@/types/transaction';

export const MOCK_TRANSACTIONS: DLDTransaction[] = [
  { id: 'txn-1', transactionDate: '2025-01-15', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', building: 'Marina Gate Tower 1', transactionValue: 2650000, propertySize: 1580, pricePerSqft: 1677, rooms: 2 },
  { id: 'txn-2', transactionDate: '2025-01-12', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', building: 'Marina Gate Tower 1', transactionValue: 2900000, propertySize: 1650, pricePerSqft: 1758, rooms: 2 },
  { id: 'txn-3', transactionDate: '2024-12-20', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', building: 'Cayan Tower', transactionValue: 1800000, propertySize: 1050, pricePerSqft: 1714, rooms: 1 },
  { id: 'txn-4', transactionDate: '2024-12-15', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 3200000, propertySize: 1800, pricePerSqft: 1778, rooms: 2 },
  { id: 'txn-5', transactionDate: '2024-12-01', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 4500000, propertySize: 2400, pricePerSqft: 1875, rooms: 3 },
  { id: 'txn-6', transactionDate: '2024-11-20', transactionType: 'sale', propertyType: 'apartment', area: 'Downtown Dubai', building: 'Burj Vista', transactionValue: 5200000, propertySize: 2200, pricePerSqft: 2364, rooms: 3 },
  { id: 'txn-7', transactionDate: '2024-11-15', transactionType: 'sale', propertyType: 'apartment', area: 'Downtown Dubai', transactionValue: 3800000, propertySize: 1600, pricePerSqft: 2375, rooms: 2 },
  { id: 'txn-8', transactionDate: '2024-11-01', transactionType: 'sale', propertyType: 'apartment', area: 'Downtown Dubai', transactionValue: 6500000, propertySize: 2800, pricePerSqft: 2321, rooms: 3 },
  { id: 'txn-9', transactionDate: '2024-10-25', transactionType: 'sale', propertyType: 'apartment', area: 'Business Bay', transactionValue: 1350000, propertySize: 850, pricePerSqft: 1588, rooms: 1 },
  { id: 'txn-10', transactionDate: '2024-10-20', transactionType: 'sale', propertyType: 'apartment', area: 'Business Bay', transactionValue: 2400000, propertySize: 1500, pricePerSqft: 1600, rooms: 2 },
  { id: 'txn-11', transactionDate: '2024-10-10', transactionType: 'sale', propertyType: 'apartment', area: 'JBR', transactionValue: 3600000, propertySize: 1700, pricePerSqft: 2118, rooms: 2 },
  { id: 'txn-12', transactionDate: '2024-09-28', transactionType: 'sale', propertyType: 'apartment', area: 'JBR', transactionValue: 2800000, propertySize: 1350, pricePerSqft: 2074, rooms: 2 },
  { id: 'txn-13', transactionDate: '2024-09-15', transactionType: 'sale', propertyType: 'villa', area: 'Arabian Ranches', transactionValue: 5800000, propertySize: 4200, pricePerSqft: 1381, rooms: 4 },
  { id: 'txn-14', transactionDate: '2024-09-01', transactionType: 'sale', propertyType: 'villa', area: 'Arabian Ranches', transactionValue: 7200000, propertySize: 5500, pricePerSqft: 1309, rooms: 5 },
  { id: 'txn-15', transactionDate: '2024-08-25', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Hills Estate', building: 'Park Heights', transactionValue: 1150000, propertySize: 780, pricePerSqft: 1474, rooms: 1 },
  { id: 'txn-16', transactionDate: '2024-08-15', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Hills Estate', transactionValue: 2400000, propertySize: 1600, pricePerSqft: 1500, rooms: 2 },
  { id: 'txn-17', transactionDate: '2024-08-01', transactionType: 'sale', propertyType: 'apartment', area: 'DIFC', transactionValue: 4100000, propertySize: 1500, pricePerSqft: 2733, rooms: 2 },
  { id: 'txn-18', transactionDate: '2024-07-20', transactionType: 'sale', propertyType: 'apartment', area: 'DIFC', transactionValue: 5800000, propertySize: 2200, pricePerSqft: 2636, rooms: 3 },
  { id: 'txn-19', transactionDate: '2024-07-10', transactionType: 'sale', propertyType: 'apartment', area: 'Jumeirah Village Circle', transactionValue: 480000, propertySize: 500, pricePerSqft: 960, rooms: 0 },
  { id: 'txn-20', transactionDate: '2024-07-01', transactionType: 'sale', propertyType: 'apartment', area: 'Jumeirah Village Circle', transactionValue: 850000, propertySize: 900, pricePerSqft: 944, rooms: 1 },
  { id: 'txn-21', transactionDate: '2024-06-20', transactionType: 'sale', propertyType: 'penthouse', area: 'Palm Jumeirah', transactionValue: 22000000, propertySize: 7000, pricePerSqft: 3143, rooms: 4 },
  { id: 'txn-22', transactionDate: '2024-06-10', transactionType: 'sale', propertyType: 'apartment', area: 'Palm Jumeirah', transactionValue: 8500000, propertySize: 2800, pricePerSqft: 3036, rooms: 3 },
  { id: 'txn-23', transactionDate: '2024-06-01', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Creek Harbour', transactionValue: 3800000, propertySize: 2100, pricePerSqft: 1810, rooms: 3 },
  { id: 'txn-24', transactionDate: '2024-05-15', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Creek Harbour', transactionValue: 1900000, propertySize: 1100, pricePerSqft: 1727, rooms: 1 },
  { id: 'txn-25', transactionDate: '2024-05-01', transactionType: 'sale', propertyType: 'apartment', area: 'Emaar Beachfront', transactionValue: 7200000, propertySize: 2750, pricePerSqft: 2618, rooms: 3 },
  { id: 'txn-26', transactionDate: '2024-04-20', transactionType: 'sale', propertyType: 'villa', area: 'Damac Hills', transactionValue: 3400000, propertySize: 3400, pricePerSqft: 1000, rooms: 3 },
  { id: 'txn-27', transactionDate: '2024-04-10', transactionType: 'sale', propertyType: 'apartment', area: 'Sobha Hartland', transactionValue: 2100000, propertySize: 1250, pricePerSqft: 1680, rooms: 2 },
  { id: 'txn-28', transactionDate: '2024-03-25', transactionType: 'sale', propertyType: 'apartment', area: 'Jumeirah Lake Towers', transactionValue: 600000, propertySize: 550, pricePerSqft: 1091, rooms: 0 },
  { id: 'txn-29', transactionDate: '2024-03-15', transactionType: 'sale', propertyType: 'townhouse', area: 'Dubai Hills Estate', transactionValue: 4600000, propertySize: 3400, pricePerSqft: 1353, rooms: 4 },
  { id: 'txn-30', transactionDate: '2024-03-01', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 2500000, propertySize: 1450, pricePerSqft: 1724, rooms: 2 },
  { id: 'txn-31', transactionDate: '2024-02-20', transactionType: 'sale', propertyType: 'apartment', area: 'Downtown Dubai', transactionValue: 2900000, propertySize: 1300, pricePerSqft: 2231, rooms: 1 },
  { id: 'txn-32', transactionDate: '2024-02-10', transactionType: 'sale', propertyType: 'apartment', area: 'Business Bay', transactionValue: 1800000, propertySize: 1200, pricePerSqft: 1500, rooms: 1 },
  { id: 'txn-33', transactionDate: '2024-02-01', transactionType: 'sale', propertyType: 'villa', area: 'Arabian Ranches', transactionValue: 6200000, propertySize: 4800, pricePerSqft: 1292, rooms: 5 },
  { id: 'txn-34', transactionDate: '2024-01-25', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Hills Estate', transactionValue: 1800000, propertySize: 1250, pricePerSqft: 1440, rooms: 2 },
  { id: 'txn-35', transactionDate: '2024-01-15', transactionType: 'sale', propertyType: 'apartment', area: 'Palm Jumeirah', transactionValue: 5500000, propertySize: 1900, pricePerSqft: 2895, rooms: 2 },
  { id: 'txn-36', transactionDate: '2024-01-01', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 1600000, propertySize: 980, pricePerSqft: 1633, rooms: 1 },
  { id: 'txn-37', transactionDate: '2023-12-15', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 2300000, propertySize: 1500, pricePerSqft: 1533, rooms: 2 },
  { id: 'txn-38', transactionDate: '2023-11-20', transactionType: 'sale', propertyType: 'apartment', area: 'Downtown Dubai', transactionValue: 4800000, propertySize: 2200, pricePerSqft: 2182, rooms: 3 },
  { id: 'txn-39', transactionDate: '2023-10-10', transactionType: 'sale', propertyType: 'apartment', area: 'Business Bay', transactionValue: 1100000, propertySize: 780, pricePerSqft: 1410, rooms: 1 },
  { id: 'txn-40', transactionDate: '2023-09-15', transactionType: 'sale', propertyType: 'apartment', area: 'Jumeirah Village Circle', transactionValue: 420000, propertySize: 480, pricePerSqft: 875, rooms: 0 },
  { id: 'txn-41', transactionDate: '2023-08-20', transactionType: 'sale', propertyType: 'villa', area: 'Dubai Hills Estate', transactionValue: 5200000, propertySize: 3800, pricePerSqft: 1368, rooms: 4 },
  { id: 'txn-42', transactionDate: '2023-07-15', transactionType: 'sale', propertyType: 'apartment', area: 'DIFC', transactionValue: 3500000, propertySize: 1400, pricePerSqft: 2500, rooms: 2 },
  { id: 'txn-43', transactionDate: '2023-06-10', transactionType: 'sale', propertyType: 'apartment', area: 'Palm Jumeirah', transactionValue: 7800000, propertySize: 2800, pricePerSqft: 2786, rooms: 3 },
  { id: 'txn-44', transactionDate: '2023-05-20', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Creek Harbour', transactionValue: 3200000, propertySize: 2000, pricePerSqft: 1600, rooms: 2 },
  { id: 'txn-45', transactionDate: '2023-04-15', transactionType: 'sale', propertyType: 'apartment', area: 'JBR', transactionValue: 2500000, propertySize: 1350, pricePerSqft: 1852, rooms: 2 },
  { id: 'txn-46', transactionDate: '2023-03-10', transactionType: 'sale', propertyType: 'apartment', area: 'Emaar Beachfront', transactionValue: 6000000, propertySize: 2500, pricePerSqft: 2400, rooms: 3 },
  { id: 'txn-47', transactionDate: '2023-02-15', transactionType: 'sale', propertyType: 'apartment', area: 'Sobha Hartland', transactionValue: 1800000, propertySize: 1200, pricePerSqft: 1500, rooms: 2 },
  { id: 'txn-48', transactionDate: '2023-01-20', transactionType: 'sale', propertyType: 'apartment', area: 'Dubai Marina', transactionValue: 2100000, propertySize: 1400, pricePerSqft: 1500, rooms: 2 },
  { id: 'txn-49', transactionDate: '2023-01-10', transactionType: 'sale', propertyType: 'villa', area: 'Damac Hills', transactionValue: 2800000, propertySize: 3200, pricePerSqft: 875, rooms: 3 },
  { id: 'txn-50', transactionDate: '2023-01-01', transactionType: 'sale', propertyType: 'apartment', area: 'Jumeirah Lake Towers', transactionValue: 520000, propertySize: 520, pricePerSqft: 1000, rooms: 0 },
];

export function getMockTransactionsForArea(area: string): DLDTransaction[] {
  return MOCK_TRANSACTIONS.filter(t =>
    t.area.toLowerCase().includes(area.toLowerCase())
  );
}

export function getMockPriceHistory(area: string): PriceHistoryPoint[] {
  const months = [
    '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
    '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    '2025-01',
  ];

  // Base prices per sqft by area
  const basePrices: Record<string, number> = {
    'Dubai Marina': 1500,
    'Downtown Dubai': 2100,
    'Palm Jumeirah': 2700,
    'Business Bay': 1400,
    'JBR': 1800,
    'Dubai Hills Estate': 1300,
    'Jumeirah Village Circle': 800,
    'Arabian Ranches': 1200,
    'DIFC': 2400,
    'Dubai Creek Harbour': 1600,
  };

  const base = basePrices[area] || 1200;
  let price = base;

  return months.map((date) => {
    const growth = 1 + (Math.random() * 0.03 + 0.005); // 0.5-3.5% monthly growth
    price = Math.round(price * growth);
    return {
      date,
      avgPricePerSqft: price,
      transactionCount: Math.floor(Math.random() * 30) + 10,
    };
  });
}
