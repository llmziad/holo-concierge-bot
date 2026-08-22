export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePerSqft: number;
  currency: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number; // sqft
  location: PropertyLocation;
  images: string[];
  amenities: string[];
  agent: PropertyAgent;
  purpose: 'for-sale' | 'for-rent';
  furnishing: string;
  completionStatus: string;
  addedOn: string;
  floorPlan?: { images2d: string[]; images3d: string[]; models: string[] };
  // Market intelligence (computed)
  marketComparison?: MarketComparison;
  matchScore?: number;
  matchReasons?: string[];
  investmentMetrics?: InvestmentMetrics;
}

export type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'penthouse' | 'duplex' | 'land';

export interface PropertyLocation {
  area: string;
  building?: string;
  city: string;
  lat?: number;
  lng?: number;
  slug?: string;
}

export interface PropertyAgent {
  name: string;
  company: string;
  phone?: string;
  avatar?: string;
}

export interface MarketComparison {
  medianPricePerSqft: number;
  propertyPricePerSqft: number;
  percentageDiff: number; // negative = below market (good for buyer)
  sampleSize: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface InvestmentMetrics {
  grossRentalYield: number;
  netRentalYield: number;
  capitalAppreciation: number;
  fiveYearROI: number;
  estimatedAnnualRent: number;
  estimatedMonthlyRent: number;
  serviceCharge: number;
}

export interface PropertySearchParams {
  purpose?: 'for-sale' | 'for-rent';
  locationExternalIDs?: string;
  categoryExternalID?: string; // 1=apartment, 2=villa, etc.
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  sort?: string;
  page?: number;
  hitsPerPage?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BayutHit {
  id: number;
  externalID: string;
  title: string;
  description: string;
  price: number;
  area: number[];
  rooms: number;
  baths: number;
  purpose: string;
  category: { name: string; slug: string }[];
  location: { name: string; slug: string; externalID: string }[];
  coverPhoto: { url: string };
  photoCount: number;
  photos: { url: string }[];
  amenities: { text: string }[];
  contactName: string;
  agency: { name: string; logo?: { url: string } };
  phoneNumber?: { mobile?: string };
  furnishingStatus?: string;
  completionStatus?: string;
  createdAt: number;
  geography?: { lat: number; lng: number };
}
