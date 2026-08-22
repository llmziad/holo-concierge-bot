export interface DubaiArea {
  name: string;
  slug: string;
  externalID: string;
  emoji: string;
  popular: boolean;
}

export const DUBAI_AREAS: DubaiArea[] = [
  { name: 'Dubai Marina', slug: 'dubai-marina', externalID: '36', emoji: '🏙️', popular: true },
  { name: 'Downtown Dubai', slug: 'downtown-dubai', externalID: '10', emoji: '🏗️', popular: true },
  { name: 'Palm Jumeirah', slug: 'palm-jumeirah', externalID: '14', emoji: '🌴', popular: true },
  { name: 'Business Bay', slug: 'business-bay', externalID: '54', emoji: '💼', popular: true },
  { name: 'JBR', slug: 'jumeirah-beach-residence-jbr', externalID: '87', emoji: '🏖️', popular: true },
  { name: 'Dubai Hills Estate', slug: 'dubai-hills-estate', externalID: '53', emoji: '🏡', popular: true },
  { name: 'Jumeirah Village Circle', slug: 'jumeirah-village-circle-jvc', externalID: '59', emoji: '🏘️', popular: true },
  { name: 'Arabian Ranches', slug: 'arabian-ranches', externalID: '168', emoji: '🐎', popular: true },
  { name: 'DIFC', slug: 'difc', externalID: '117', emoji: '🏦', popular: true },
  { name: 'Dubai Creek Harbour', slug: 'dubai-creek-harbour', externalID: '242', emoji: '🌊', popular: true },
  { name: 'Jumeirah Lake Towers', slug: 'jumeirah-lake-towers-jlt', externalID: '12', emoji: '🏢', popular: false },
  { name: 'Al Barsha', slug: 'al-barsha', externalID: '105', emoji: '🏬', popular: false },
  { name: 'Dubai Silicon Oasis', slug: 'dubai-silicon-oasis', externalID: '295', emoji: '💻', popular: false },
  { name: 'Motor City', slug: 'motor-city', externalID: '268', emoji: '🏎️', popular: false },
  { name: 'Sports City', slug: 'dubai-sports-city', externalID: '67', emoji: '⚽', popular: false },
  { name: 'International City', slug: 'international-city', externalID: '368', emoji: '🌍', popular: false },
  { name: 'Al Furjan', slug: 'al-furjan', externalID: '41', emoji: '🏗️', popular: false },
  { name: 'Town Square', slug: 'town-square', externalID: '386', emoji: '🏡', popular: false },
  { name: 'Damac Hills', slug: 'damac-hills', externalID: '279', emoji: '⛳', popular: false },
  { name: 'Mirdif', slug: 'mirdif', externalID: '613', emoji: '🏠', popular: false },
  { name: 'Dubai South', slug: 'dubai-south-dubai-world-central', externalID: '3355', emoji: '✈️', popular: false },
  { name: 'Sobha Hartland', slug: 'sobha-hartland', externalID: '835', emoji: '🌳', popular: false },
  { name: 'Emaar Beachfront', slug: 'emaar-beachfront', externalID: '3513', emoji: '🏖️', popular: false },
  { name: 'Bluewaters Island', slug: 'bluewaters-island', externalID: '1754', emoji: '🎡', popular: false },
  { name: 'City Walk', slug: 'city-walk', externalID: '24', emoji: '🛍️', popular: false },
  { name: 'Jumeirah', slug: 'jumeirah', externalID: '23', emoji: '🏖️', popular: false },
  { name: 'The Greens', slug: 'the-greens', externalID: '47', emoji: '🌿', popular: false },
  { name: 'Discovery Gardens', slug: 'discovery-gardens', externalID: '13', emoji: '🌺', popular: false },
  { name: 'Dubai Production City', slug: 'dubai-production-city-impz', externalID: '5036', emoji: '🏭', popular: false },
  { name: 'Tilal Al Ghaf', slug: 'tilal-al-ghaf', externalID: '5173', emoji: '🏡', popular: false },
];

export const POPULAR_AREAS = DUBAI_AREAS.filter(a => a.popular);
