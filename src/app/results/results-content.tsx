'use client';

import { useSearchParams } from 'next/navigation';
import { usePropertySearch } from '@/hooks/use-property-search';
import { AIProcessingScreen } from '@/components/results/ai-processing-screen';
import { ResultsGrid } from '@/components/results/results-grid';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ResultsContent() {
  const searchParams = useSearchParams();

  const params = {
    goal: searchParams.get('goal') || 'both',
    budgetMin: searchParams.get('budgetMin') || '500000',
    budgetMax: searchParams.get('budgetMax') || '5000000',
    locationId: searchParams.get('locationId') || '',
    locationName: searchParams.get('locationName') || 'Dubai',
    areas: searchParams.get('areas') || '',
    propertyType: searchParams.get('propertyType') || 'any',
    bedrooms: searchParams.get('bedrooms') || '',
  };

  const { data, isLoading, error } = usePropertySearch(params);

  if (isLoading) {
    return <AIProcessingScreen />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-lg text-destructive mb-2">Something went wrong</p>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn&apos;t fetch your results. Please try again.
        </p>
        <Link href="/questionnaire">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (!data || data.properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-lg mb-2">No properties found</p>
        <p className="text-sm text-muted-foreground mb-6">
          Try adjusting your criteria for better results.
        </p>
        <Link href="/questionnaire">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Adjust Search
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <ResultsGrid
      properties={data.properties}
      total={data.total}
    />
  );
}
