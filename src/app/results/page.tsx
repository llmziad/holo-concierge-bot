'use client';

import { Suspense } from 'react';
import { Navbar } from '@/components/shared/navbar';
import { ResultsContent } from './results-content';
import { CompareTray } from '@/components/compare/compare-tray';

export default function ResultsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading...</div>}>
          <ResultsContent />
        </Suspense>
      </div>
      <CompareTray />
    </main>
  );
}
