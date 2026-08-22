'use client';

import { usePropertyDetail, useTransactions, useAIAnalysis } from '@/hooks/use-property-search';
import { Navbar } from '@/components/shared/navbar';
import { Gallery } from '@/components/property/gallery';
import { InvestmentMetricsPanel } from '@/components/property/investment-metrics-panel';
import { TransactionHistory } from '@/components/property/transaction-history';
import { AIInsights } from '@/components/property/ai-insights';
import { AreaComparisonChart } from '@/components/charts/area-comparison-chart';
import { PriceHistoryChart } from '@/components/charts/price-history-chart';
import { ROIProjectionChart } from '@/components/charts/roi-projection-chart';
import { FloorPlanReimagine } from '@/components/property/floor-plan-reimagine';
import { getMarketBadge } from '@/lib/market/comparison';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PropertyInquiryForm } from '@/components/property/property-inquiry-form';
import { MortgageCalculator } from '@/components/property/mortgage-calculator';
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Building, Calendar,
  Sofa, TrendingUp, Info, Landmark, Sparkles, Calculator, FileText
} from 'lucide-react';

export function PropertyDetailContent({ id }: { id: string }) {
  const { data, isLoading } = usePropertyDetail(id);
  const property = data?.property;
  const transactions = data?.transactions || [];

  const { data: dldData } = useTransactions(
    property?.location?.area || null,
    true
  );

  const { data: analysis, isLoading: analysisLoading } = useAIAnalysis(
    property?.id || null
  );

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-[2/1] w-full rounded-xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 text-center">
          <p className="text-lg mb-4">Property not found</p>
          <Link href="/results">
            <Button variant="outline">Back to Results</Button>
          </Link>
        </div>
      </main>
    );
  }

  const marketBadge = property.marketComparison
    ? getMarketBadge(property.marketComparison.percentageDiff)
    : null;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Back link */}
        <Link href="/results" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Gallery images={property.images} title={property.title} />
        </motion.div>

        {/* Floor Plan Reimagine */}
        {property.floorPlan?.images2d?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 p-5 sm:p-7 card-paper rounded-2xl overflow-hidden"
          >
            <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Floor Plan Reimagine
            </h2>
            <FloorPlanReimagine
              floorPlanUrl={property.floorPlan.images2d[0]}
              bedrooms={property.bedrooms}
              area={property.area}
              propertyType={property.type}
              title={property.title}
            />
          </motion.section>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {marketBadge && (
                  <Badge
                    variant="outline"
                    className={
                      marketBadge.variant === 'gain'
                        ? 'border-gain/30 bg-gain/10 text-gain'
                        : marketBadge.variant === 'loss'
                        ? 'border-loss/30 bg-loss/10 text-loss'
                        : 'border-border'
                    }
                  >
                    {marketBadge.label}
                  </Badge>
                )}
                {dldData?.metadata?.source === 'live' ? (
                  <Badge variant="outline" className="border-gain/30 bg-gain/10 text-gain">
                    <Landmark className="w-3 h-3 mr-1" />
                    DLD-backed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gold/40 bg-gold/10 text-gold-foreground">
                    <Info className="w-3 h-3 mr-1" />
                    Market estimate
                  </Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-2">{property.title}</h1>

              <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{property.location.area}{property.location.building ? `, ${property.location.building}` : ''}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-4">
                <span className="font-mono tabular text-3xl sm:text-4xl font-semibold tracking-tight">AED {property.price.toLocaleString()}</span>
                <span className="font-mono tabular text-muted-foreground text-sm">
                  {property.pricePerSqft.toLocaleString()} AED/sqft
                </span>
              </div>

              {/* Specs row */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedrooms`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 text-muted-foreground" />
                  <span>{property.area.toLocaleString()} sqft</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{property.type}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sofa className="w-4 h-4 text-muted-foreground" />
                  <span>{property.furnishing}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{property.completionStatus}</span>
                </div>
              </div>

              <Link
                href={`/property/${property.id}/report`}
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary" />
                View investment report
              </Link>
            </motion.div>

            {/* Investment Metrics */}
            {property.investmentMetrics && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Investment Metrics
                </h2>
                <InvestmentMetricsPanel metrics={property.investmentMetrics} price={property.price} />
              </motion.section>
            )}

            {/* Mortgage & affordability */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Mortgage &amp; affordability
              </h2>
              <MortgageCalculator price={property.price} />
            </motion.section>

            {/* Price Comparison Chart */}
            {property.marketComparison && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 sm:p-7 card-paper rounded-2xl"
              >
                <h2 className="font-serif text-xl font-semibold mb-4">Price vs Area Average</h2>
                <AreaComparisonChart
                  propertyPricePerSqft={property.marketComparison.propertyPricePerSqft}
                  medianPricePerSqft={property.marketComparison.medianPricePerSqft}
                  areaName={property.location.area}
                />
              </motion.section>
            )}

            {/* DLD Transaction History */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 sm:p-7 card-paper rounded-2xl"
            >
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                Comparable transactions — {property.location.area}
              </h2>
              <TransactionHistory transactions={transactions} areaName={property.location.area} />
            </motion.section>

            {/* Price History Chart */}
            {dldData?.priceHistory && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-5 sm:p-7 card-paper rounded-2xl"
              >
                <h2 className="font-serif text-xl font-semibold mb-4">Price Trend — {property.location.area}</h2>
                <PriceHistoryChart data={dldData.priceHistory} />
              </motion.section>
            )}

            {/* ROI Projection */}
            {property.investmentMetrics && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-5 sm:p-7 card-paper rounded-2xl"
              >
                <h2 className="font-serif text-xl font-semibold mb-4">5-Year ROI Projection</h2>
                <ROIProjectionChart purchasePrice={property.price} metrics={property.investmentMetrics} />
                <p className="text-xs text-muted-foreground mt-2">
                  Solid line: realizable value if sold (net of ~2% exit costs) plus cumulative net rent.
                  Dashed: gross property value. ROI is measured against total invested, including ~6% buying costs.
                </p>
              </motion.section>
            )}

            {/* AI Insights */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-5 sm:p-7 card-paper rounded-2xl"
            >
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="gradient-text">AI Investment Analysis</span>
              </h2>
              <AIInsights analysis={analysis} isLoading={analysisLoading} />
            </motion.section>
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-4">
            {/* Agent card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 sm:p-7 card-paper rounded-2xl sticky top-24"
            >
              <h3 className="text-sm font-semibold mb-1">Interested in this property?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Leave your details and we&apos;ll help you secure it.
              </p>

              <PropertyInquiryForm propertyTitle={property.title} propertyId={property.id} />

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {property.agent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{property.agent.name}</p>
                  <p className="text-xs text-muted-foreground">{property.agent.company}</p>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {property.amenities.map((amenity: string) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
