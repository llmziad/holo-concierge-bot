'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePropertyDetail, useTransactions } from '@/hooks/use-property-search';
import { useMounted } from '@/hooks/use-mounted';
import { getMarketBadge } from '@/lib/market/comparison';
import { DLDTransaction } from '@/types/transaction';
import { Emblem } from '@/components/shared/emblem';
import { Button } from '@/components/ui/button';
import { formatAed as aed, mortgageBreakdown } from '@/lib/finance';
import { ArrowLeft, Printer } from 'lucide-react';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePropertyDetail(id);
  const property = data?.property;
  const { data: dld } = useTransactions(property?.location?.area || null, false);

  // Client-only date (avoids SSR/hydration mismatch) without a setState effect.
  const mounted = useMounted();
  const preparedOn = mounted
    ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Preparing report…</div>;
  }
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Property not found.</p>
        <Link href="/results"><Button variant="outline">Back to results</Button></Link>
      </div>
    );
  }

  const m = property.investmentMetrics;
  const cmp = property.marketComparison;
  const badge = cmp ? getMarketBadge(cmp.percentageDiff) : null;
  const mort = mortgageBreakdown(property.price, 20, 4.5, 25);
  const comps = (dld?.transactions || []).slice(0, 6);
  const source = dld?.metadata?.source === 'live' ? 'DLD-registered transactions' : 'area benchmarks (illustrative)';

  return (
    <main className="min-h-screen bg-background print:bg-white">
      {/* Action bar — hidden in print */}
      <div className="no-print sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href={`/property/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to property
          </Link>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <article className="report max-w-3xl mx-auto px-6 sm:px-10 py-10 print:py-0">
        {/* Letterhead */}
        <header className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div className="flex items-center gap-2.5">
            <Emblem className="w-8 h-8" />
            <span className="text-sm font-medium">Dubai Real Estate Intelligence</span>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.14em] uppercase text-muted-foreground">Investment report</p>
            {preparedOn && <p className="text-xs text-muted-foreground mt-0.5">Prepared {preparedOn}</p>}
          </div>
        </header>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {badge && (
              <span className={`text-xs font-medium ${badge.variant === 'gain' ? 'text-gain' : badge.variant === 'loss' ? 'text-loss' : 'text-muted-foreground'}`}>
                {badge.label}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">{property.title}</h1>
          <p className="text-muted-foreground mt-1">
            {property.location.area}{property.location.building ? `, ${property.location.building}` : ''}
          </p>
          <p className="font-mono tabular text-2xl font-semibold mt-4">{aed(property.price)}</p>
          <p className="font-mono tabular text-sm text-muted-foreground">
            {property.pricePerSqft.toLocaleString()} AED/sqft · {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`} · {property.bathrooms} bath · {property.area.toLocaleString()} sqft
          </p>
        </div>

        {/* Key metrics */}
        {m && (
          <section className="mb-8">
            <h2 className="font-serif text-lg font-semibold mb-3">Investment summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: 'Net rental yield', v: `${m.netRentalYield.toFixed(1)}%` },
                { k: 'Capital appreciation', v: `${m.capitalAppreciation.toFixed(1)}%/yr` },
                { k: '5-year projected ROI', v: `${m.fiveYearROI.toFixed(0)}%` },
                { k: 'Est. annual rent', v: aed(m.estimatedAnnualRent) },
              ].map((s) => (
                <div key={s.k} className="border border-border rounded-xl p-3">
                  <div className="font-mono tabular text-lg font-semibold">{s.v}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{s.k}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Market position */}
        {cmp && (
          <section className="mb-8">
            <h2 className="font-serif text-lg font-semibold mb-3">Market position</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">This property (AED/sqft)</dt>
              <dd className="font-mono tabular text-right">{cmp.propertyPricePerSqft.toLocaleString()}</dd>
              <dt className="text-muted-foreground">{property.location.area} median (AED/sqft)</dt>
              <dd className="font-mono tabular text-right">{cmp.medianPricePerSqft.toLocaleString()}</dd>
              <dt className="text-muted-foreground">Difference vs market</dt>
              <dd className={`font-mono tabular text-right ${cmp.percentageDiff < 0 ? 'text-gain' : cmp.percentageDiff > 0 ? 'text-loss' : ''}`}>
                {cmp.percentageDiff > 0 ? '+' : ''}{cmp.percentageDiff.toFixed(1)}%
              </dd>
            </dl>
          </section>
        )}

        {/* Financing snapshot */}
        <section className="mb-8">
          <h2 className="font-serif text-lg font-semibold mb-3">Financing snapshot</h2>
          <p className="text-xs text-muted-foreground mb-3">Assumes 20% down payment, 4.5% rate over 25 years, incl. 4% DLD + 2% agency fees.</p>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Monthly repayment</dt>
            <dd className="font-mono tabular text-right">{aed(mort.monthly)}</dd>
            <dt className="text-muted-foreground">Down payment</dt>
            <dd className="font-mono tabular text-right">{aed(mort.down)}</dd>
            <dt className="text-muted-foreground">Cash needed to close</dt>
            <dd className="font-mono tabular text-right font-semibold">{aed(mort.cashToClose)}</dd>
          </dl>
        </section>

        {/* Comparables */}
        {comps.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-lg font-semibold mb-3">Comparable transactions</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-1.5 font-medium">Date</th>
                  <th className="py-1.5 font-medium">Price</th>
                  <th className="py-1.5 font-medium">Size</th>
                  <th className="py-1.5 font-medium text-right">AED/sqft</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((t: DLDTransaction, i: number) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-1.5 font-mono tabular">{t.transactionDate}</td>
                    <td className="py-1.5 font-mono tabular">{aed(t.transactionValue)}</td>
                    <td className="py-1.5 font-mono tabular">{t.propertySize.toLocaleString()} sqft</td>
                    <td className="py-1.5 font-mono tabular text-right">{t.pricePerSqft.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Footer / disclaimer */}
        <footer className="border-t border-border pt-4 text-[11px] text-muted-foreground leading-relaxed">
          Market figures are based on {source} and standard assumptions (≈5% vacancy, ≈1% annual maintenance;
          appreciation shown conservatively). This report is for research only and is not valuation, financial,
          or investment advice. Verify all figures independently before transacting.
        </footer>
      </article>
    </main>
  );
}
