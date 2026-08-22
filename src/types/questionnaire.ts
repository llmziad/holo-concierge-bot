export type GoalType = 'investment' | 'living' | 'both';

export type PropertyTypePreference = 'apartment' | 'villa' | 'townhouse' | 'any';

export interface QuestionnaireState {
  step: number;
  goal: GoalType | null;
  budgetMin: number;
  budgetMax: number;
  locationId: string | null;
  locationName: string | null;
  preferredAreas: string[];
  propertyType: PropertyTypePreference | null;
  bedrooms: number | null;
  isComplete: boolean;
}

export interface QuestionnaireActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setGoal: (goal: GoalType) => void;
  setBudget: (min: number, max: number) => void;
  setLocation: (id: string, name: string) => void;
  setPreferredAreas: (areas: string[]) => void;
  toggleArea: (area: string) => void;
  setPropertyType: (type: PropertyTypePreference) => void;
  setBedrooms: (bedrooms: number) => void;
  complete: () => void;
  reset: () => void;
  toSearchParams: () => Record<string, string>;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  slug: string;
  hierarchy: string;
  externalID: string;
}
