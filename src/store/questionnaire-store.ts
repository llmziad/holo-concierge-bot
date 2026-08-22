import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QuestionnaireState, QuestionnaireActions } from '@/types/questionnaire';

const TOTAL_STEPS = 5;

export const useQuestionnaireStore = create<QuestionnaireState & QuestionnaireActions>()(
  persist(
    (set, get) => ({
      // State
      step: 1,
      goal: null,
      budgetMin: 500000,
      budgetMax: 5000000,
      locationId: null,
      locationName: null,
      preferredAreas: [],
      propertyType: null,
      bedrooms: null,
      isComplete: false,

      // Actions
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, TOTAL_STEPS) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      setGoal: (goal) => set({ goal }),
      setBudget: (min, max) => set({ budgetMin: min, budgetMax: max }),
      setLocation: (id, name) => set({ locationId: id, locationName: name }),
      setPreferredAreas: (areas) => set({ preferredAreas: areas }),
      toggleArea: (area) => set((state) => ({
        preferredAreas: state.preferredAreas.includes(area)
          ? state.preferredAreas.filter((a) => a !== area)
          : [...state.preferredAreas, area],
      })),
      setPropertyType: (type) => set({ propertyType: type }),
      setBedrooms: (bedrooms) => set({ bedrooms }),
      complete: () => set({ isComplete: true }),

      reset: () => set({
        step: 1,
        goal: null,
        budgetMin: 500000,
        budgetMax: 5000000,
        locationId: null,
        locationName: null,
        preferredAreas: [],
        propertyType: null,
        bedrooms: null,
        isComplete: false,
      }),

      toSearchParams: () => {
        const state = get();
        const params: Record<string, string> = {};
        if (state.goal) params.goal = state.goal;
        params.budgetMin = state.budgetMin.toString();
        params.budgetMax = state.budgetMax.toString();
        if (state.locationId) params.locationId = state.locationId;
        if (state.locationName) params.locationName = state.locationName;
        if (state.preferredAreas.length > 0) params.areas = state.preferredAreas.join(',');
        if (state.propertyType) params.propertyType = state.propertyType;
        if (state.bedrooms !== null) params.bedrooms = state.bedrooms.toString();
        return params;
      },
    }),
    {
      name: 'dubai-re-questionnaire',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return sessionStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
