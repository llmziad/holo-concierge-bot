'use client';

import { useQuery } from '@tanstack/react-query';
import { LocationSuggestion } from '@/types/questionnaire';
import { useState, useCallback } from 'react';

export function useLocationSearch() {
  const [query, setQuery] = useState('');

  const { data: suggestions = [], isLoading } = useQuery<LocationSuggestion[]>({
    queryKey: ['locations', query],
    queryFn: async () => {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: query.length >= 0,
    staleTime: 60 * 1000,
  });

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { suggestions, isLoading, search, query };
}
