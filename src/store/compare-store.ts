import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Property } from '@/types/property';

export const MAX_COMPARE = 4;

interface CompareState {
  items: Property[];
  toggle: (property: Property) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (property) =>
        set((state) => {
          const exists = state.items.some((p) => p.id === property.id);
          if (exists) {
            return { items: state.items.filter((p) => p.id !== property.id) };
          }
          if (state.items.length >= MAX_COMPARE) return state; // cap silently; UI disables at max
          return { items: [...state.items, property] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((p) => p.id !== id) })),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((p) => p.id === id),
      isFull: () => get().items.length >= MAX_COMPARE,
    }),
    {
      name: 'dubai-re-compare',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
    }
  )
);
