export const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: '4',
  villa: '3',
  townhouse: '16',
  penthouse: '18',
  duplex: '21',
  land: '14',
  any: '',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  townhouse: 'Townhouse',
  penthouse: 'Penthouse',
  duplex: 'Duplex',
  land: 'Land',
};

export const BEDROOM_OPTIONS = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 BR' },
  { value: 2, label: '2 BR' },
  { value: 3, label: '3 BR' },
  { value: 4, label: '4 BR' },
  { value: 5, label: '5+ BR' },
];
