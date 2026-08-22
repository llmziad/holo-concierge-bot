import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { MARKET_BENCHMARKS } from '@/data/market-benchmarks';
import { DUBAI_AREAS } from '@/lib/constants/dubai-areas';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dubai Area Guide — Yields, Prices & Appreciation',
  description:
    'Compare 30 Dubai communities by rental yield, price per square foot, and year-on-year appreciation. Benchmarked to Dubai Land Department transaction data.',
  alternates: { canonical: '/areas' },
};

function emojiFor(name: string): string {
  return DUBAI_AREAS.find((a) => a.name === name)?.emoji ?? '📍';
}

const trendIcon = { rising: TrendingUp, falling: TrendingDown, stable: Minus };
const trendTone = { rising: 'text-gain', falling: 'text-loss', stable: 'text-muted-foreground' };

export default function AreasIndexPage() {
  const areas = Object.entries(MARKET_BENCHMARKS)
    .map(([slug, b]) => ({ slug, ...b }))
    .sort((a, b) => b.yoyAppreciation - a.yoyAppreciation);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-5 sm:px-6 max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
            <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
              Area guide
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
            Every Dubai community, by the numbers.
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Rental yield, price per square foot, and year-on-year appreciation for {areas.length} communities —
            benchmarked to Dubai Land Department transaction data.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((a) => {
            const TrendIcon = trendIcon[a.trend];
            return (
              <Link
                key={a.slug}
                href={`/areas/${a.slug}`}
                className="group card-paper rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl" aria-hidden="true">{emojiFor(a.area)}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h2 className="font-serif text-lg font-semibold mb-3">{a.area}</h2>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Avg /sqft</dt>
                    <dd className="font-mono tabular font-medium">AED {a.avgPricePerSqft.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Gross yield</dt>
                    <dd className="font-mono tabular font-medium text-gain">{a.avgRentalYield.toFixed(1)}%</dd>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 pt-1">
                    <TrendIcon className={`w-3.5 h-3.5 ${trendTone[a.trend]}`} />
                    <span className={`font-mono tabular text-xs ${trendTone[a.trend]}`}>
                      {a.yoyAppreciation > 0 ? '+' : ''}{a.yoyAppreciation.toFixed(1)}% YoY
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">· {a.trend}</span>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
