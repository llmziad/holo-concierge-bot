'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/store/compare-store';
import { getMarketBadge } from '@/lib/market/comparison';
import { Property } from '@/types/property';
import { formatAed } from '@/lib/finance';
import { ArrowLeft, X, Scale } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';

type Row = {
  label: string;
  render: (p: Property) => React.ReactNode;
  best?: (items: Property[]) => string | null; // property id that "wins" this row
  mono?: boolean;
};

const aed = (n: number) => formatAed(n);

const rows: Row[] = [
  { label: 'Price', mono: true, render: (p) => aed(p.price), best: (i) => minBy(i, (p) => p.price) },
  { label: 'Price / sqft', mono: true, render: (p) => aed(p.pricePerSqft), best: (i) => minBy(i, (p) => p.pricePerSqft) },
  {
    label: 'Vs market',
    render: (p) => {
      const b = p.marketComparison ? getMarketBadge(p.marketComparison.percentageDiff) : null;
      if (!b) return <span className="text-muted-foreground">—</span>;
      const tone = b.variant === 'gain' ? 'text-gain' : b.variant === 'loss' ? 'text-loss' : 'text-muted-foreground';
      return <span className={`font-medium ${tone}`}>{b.label}</span>;
    },
    best: (i) => minBy(i, (p) => p.marketComparison?.percentageDiff ?? NaN),
  },
  { label: 'Bedrooms', render: (p) => (p.bedrooms === 0 ? 'Studio' : `${p.bedrooms}`) },
  { label: 'Bathrooms', render: (p) => `${p.bathrooms}` },
  { label: 'Size', mono: true, render: (p) => `${p.area.toLocaleString()} sqft`, best: (i) => maxBy(i, (p) => p.area) },
  { label: 'Type', render: (p) => <span className="capitalize">{p.type}</span> },
  {
    label: 'Net yield',
    mono: true,
    render: (p) => (p.investmentMetrics ? `${p.investmentMetrics.netRentalYield.toFixed(1)}%` : '—'),
    best: (i) => maxBy(i, (p) => p.investmentMetrics?.netRentalYield ?? NaN),
  },
  {
    label: '5-yr ROI',
    mono: true,
    render: (p) => (p.investmentMetrics ? `${p.investmentMetrics.fiveYearROI.toFixed(0)}%` : '—'),
    best: (i) => maxBy(i, (p) => p.investmentMetrics?.fiveYearROI ?? NaN),
  },
  {
    label: 'Appreciation',
    mono: true,
    render: (p) => (p.investmentMetrics ? `${p.investmentMetrics.capitalAppreciation.toFixed(1)}%` : '—'),
    best: (i) => maxBy(i, (p) => p.investmentMetrics?.capitalAppreciation ?? NaN),
  },
  { label: 'Area', render: (p) => p.location.area },
];

// Only rank rows where the underlying value is actually present (NaN accessors
// are filtered out), so an all-"—" row never highlights a phantom "best".
function minBy(items: Property[], f: (p: Property) => number): string | null {
  const valid = items.filter((p) => Number.isFinite(f(p)));
  if (valid.length < 2) return null;
  return valid.reduce((a, b) => (f(b) < f(a) ? b : a)).id;
}
function maxBy(items: Property[], f: (p: Property) => number): string | null {
  const valid = items.filter((p) => Number.isFinite(f(p)));
  if (valid.length < 2) return null;
  return valid.reduce((a, b) => (f(b) > f(a) ? b : a)).id;
}

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const mounted = useMounted();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <Link
          href="/results"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">Compare properties</h1>
          {mounted && items.length > 0 && (
            <button onClick={clear} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Clear all
            </button>
          )}
        </div>

        {!mounted ? null : items.length === 0 ? (
          <div className="card-paper rounded-2xl py-20 text-center">
            <Scale className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="font-serif text-xl font-semibold mb-2">Nothing to compare yet</p>
            <p className="text-sm text-muted-foreground mb-6">Add properties from your results to line them up side by side.</p>
            <Link href="/results">
              <Button>Browse results</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full border-separate border-spacing-0 min-w-[640px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background z-10 w-32 align-bottom" />
                  {items.map((p) => (
                    <th key={p.id} scope="col" className="p-2 align-bottom text-left" style={{ width: `${72 / items.length}%` }}>
                      <div className="card-paper rounded-xl overflow-hidden">
                        <div className="relative aspect-[16/10] bg-muted">
                          {p.images[0] && (
                            <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="240px" />
                          )}
                          <button
                            onClick={() => remove(p.id)}
                            aria-label={`Remove ${p.title}`}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-3">
                          <Link href={`/property/${p.id}`} className="font-serif text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                            {p.title}
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const bestId = row.best ? row.best(items) : null;
                  return (
                    <tr key={row.label}>
                      <th scope="row" className="sticky left-0 bg-background z-10 py-3 pr-3 text-left font-normal text-xs tracking-wide uppercase text-muted-foreground align-middle">
                        {row.label}
                      </th>
                      {items.map((p) => {
                        const isBest = bestId === p.id;
                        return (
                          <td
                            key={p.id}
                            className={`py-3 px-2 border-t border-border align-middle text-sm ${row.mono ? 'font-mono tabular' : ''} ${
                              isBest ? 'text-gain font-semibold' : ''
                            }`}
                          >
                            {row.render(p)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
