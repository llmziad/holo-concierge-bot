'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/property';
import { getMarketBadge } from '@/lib/market/comparison';
import { useCompareStore, MAX_COMPARE } from '@/store/compare-store';
import { Bed, Bath, Maximize, MapPin, TrendingUp, LayoutPanelLeft, Check, Scale } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  index: number;
}

export function PropertyCard({ property, index }: PropertyCardProps) {
  const marketBadge = property.marketComparison
    ? getMarketBadge(property.marketComparison.percentageDiff)
    : null;
  const compareItems = useCompareStore((s) => s.items);
  const toggleCompare = useCompareStore((s) => s.toggle);
  const inCompare = compareItems.some((p) => p.id === property.id);
  const compareFull = compareItems.length >= MAX_COMPARE;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/property/${property.id}`}>
        <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_40px_oklch(0.35_0.03_80_/_0.12)]">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {property.images[0] ? (
              <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}

            {/* Match score */}
            {property.matchScore && (
              <div className="absolute top-3 left-3">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
                  property.matchScore >= 80 ? 'bg-gain/90 text-background' :
                  property.matchScore >= 60 ? 'bg-primary/90 text-primary-foreground' :
                  'bg-muted/90 text-foreground'
                }`}>
                  {property.matchScore}% Match
                </div>
              </div>
            )}

            {/* Market badge */}
            {marketBadge && (
              <div className="absolute top-3 right-3">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
                  marketBadge.variant === 'gain' ? 'bg-gain/90 text-background' :
                  marketBadge.variant === 'loss' ? 'bg-loss/90 text-white' :
                  'bg-muted/90 text-foreground'
                }`}>
                  {marketBadge.label}
                </div>
              </div>
            )}
            {/* Floor plan tag */}
            {property.floorPlan && (
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm bg-primary/90 text-primary-foreground">
                  <LayoutPanelLeft className="w-3 h-3" />
                  Floor Plan
                </div>
              </div>
            )}

            {/* Compare toggle */}
            <button
              type="button"
              onClick={handleCompare}
              disabled={!inCompare && compareFull}
              aria-pressed={inCompare}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              className={`absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors disabled:opacity-40 ${
                inCompare
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/80 text-foreground hover:bg-background'
              }`}
            >
              {inCompare ? <Check className="w-3 h-3" /> : <Scale className="w-3 h-3" />}
              {inCompare ? 'Added' : 'Compare'}
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            {/* Price */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono tabular text-lg sm:text-xl font-semibold tracking-tight">
                AED {property.price.toLocaleString()}
              </span>
              <span className="font-mono tabular text-[11px] sm:text-xs text-muted-foreground">
                {property.pricePerSqft.toLocaleString()} /sqft
              </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-base font-semibold mb-2 line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{property.location.area}</span>
              {property.location.building && (
                <span className="text-muted-foreground/60">· {property.location.building}</span>
              )}
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" />
                {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                {property.area.toLocaleString()} sqft
              </span>
            </div>

            {/* ROI badge */}
            {property.investmentMetrics && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <TrendingUp className="w-3.5 h-3.5 text-gain" />
                <span className="text-xs font-mono tabular">
                  <span className="text-gain font-medium">
                    {property.investmentMetrics.netRentalYield.toFixed(1)}% yield
                  </span>
                  <span className="text-muted-foreground mx-1">·</span>
                  <span className="text-muted-foreground">
                    {property.investmentMetrics.fiveYearROI.toFixed(0)}% 5yr ROI
                  </span>
                </span>
              </div>
            )}

            {/* Match reasons */}
            {property.matchReasons && property.matchReasons.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {property.matchReasons[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
