'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Property } from '@/types/property';
import { PropertyCard } from './property-card';
import { LayoutGrid, Map as MapIcon } from 'lucide-react';

const ResultsMap = dynamic(() => import('./results-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full rounded-2xl border border-border bg-muted animate-pulse" />
  ),
});

type SortOption = 'match' | 'price-low' | 'price-high' | 'roi' | 'below-market';
type ViewMode = 'grid' | 'map';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'match', label: 'Best Match' },
  { value: 'price-low', label: 'Price: Low' },
  { value: 'price-high', label: 'Price: High' },
  { value: 'roi', label: 'Highest ROI' },
  { value: 'below-market', label: 'Below Market' },
];

interface ResultsGridProps {
  properties: Property[];
  total: number;
}

export function ResultsGrid({ properties, total }: ResultsGridProps) {
  const [sort, setSort] = useState<SortOption>('match');
  const [view, setView] = useState<ViewMode>('grid');

  const sorted = [...properties].sort((a, b) => {
    switch (sort) {
      case 'match':
        return (b.matchScore || 0) - (a.matchScore || 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'roi':
        return (b.investmentMetrics?.fiveYearROI || 0) - (a.investmentMetrics?.fiveYearROI || 0);
      case 'below-market':
        return (a.marketComparison?.percentageDiff || 0) - (b.marketComparison?.percentageDiff || 0);
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">Your matched properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'property' : 'properties'} · scored and ranked against your brief
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort chips */}
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sort === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5 ml-1">
            {([
              { v: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid view' },
              { v: 'map' as ViewMode, icon: MapIcon, label: 'Map view' },
            ]).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={label}
                aria-pressed={view === v}
                className={`p-1.5 rounded-md transition-colors ${
                  view === v ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid / Map */}
      {sorted.length > 0 && view === 'map' ? (
        <ResultsMap properties={sorted} />
      ) : sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-lg text-muted-foreground mb-2">No properties found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </motion.div>
      )}
    </div>
  );
}
