'use client';

import { Navbar } from '@/components/shared/navbar';
import { Hero } from '@/components/landing/hero';
import { ValueProps } from '@/components/landing/value-props';
import { HowItWorks } from '@/components/landing/how-it-works';
import { TrustBar } from '@/components/landing/trust-bar';
import { CTASection } from '@/components/landing/cta-section';
import { Emblem } from '@/components/shared/emblem';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueProps />
      <HowItWorks />
      <TrustBar />
      <CTASection />

      {/* Footer */}
      <footer className="py-10 px-5 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Emblem className="w-7 h-7" />
            <span className="text-sm font-medium">Dubai Real Estate Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Market figures are illustrative estimates benchmarked to Dubai Land Department
            transaction data — for research, not valuation or investment advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
