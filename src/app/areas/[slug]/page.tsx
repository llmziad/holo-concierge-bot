import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { MARKET_BENCHMARKS, getBenchmark, DEFAULT_BENCHMARK } from '@/data/market-benchmarks';
import { DUBAI_AREAS } from '@/lib/constants/dubai-areas';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search, LayoutGrid } from 'lucide-react';

export function generateStaticParams() {
  return Object.keys(MARKET_BENCHMARKS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBenchmark(slug);
  if (!b) return { title: 'Area not found' };
  return {
    title: `${b.area} Property Market — Yield & Prices`,
    description: `${b.area}: average AED ${b.avgPricePerSqft.toLocaleString()}/sqft, ${b.avgRentalYield.toFixed(
      1
    )}% gross rental yield, ${b.yoyAppreciation.toFixed(1)}% year-on-year appreciation. Benchmarked to DLD transaction data.`,
    alternates: { canonical: `/areas/${slug}` },
  };
}

const trendIcon = { rising: TrendingUp, falling: TrendingDown, stable: Minus };
const trendTone = { rising: 'text-gain', falling: 'text-loss', stable: 'text-muted-foreground' };

export default async function AreaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBenchmark(slug);
  if (!b) notFound();

  const area = DUBAI_AREAS.find((a) => a.name === b.area);
  const emoji = area?.emoji ?? '📍';
  const TrendIcon = trendIcon[b.trend];

  const vsCityPrice = Math.round(((b.avgPricePerSqft - DEFAULT_BENCHMARK.avgPricePerSqft) / DEFAULT_BENCHMARK.avgPricePerSqft) * 100);
  const vsCityYield = +(b.avgRentalYield - DEFAULT_BENCHMARK.avgRentalYield).toFixed(1);

  const searchHref = `/results?goal=investment&budgetMin=500000&budgetMax=15000000&areas=${slug}&locationName=${encodeURIComponent(
    b.area
  )}`;

  const stats = [
    { label: 'Average price / sqft', value: `AED ${b.avgPricePerSqft.toLocaleString()}`, note: `${vsCityPrice >= 0 ? '+' : ''}${vsCityPrice}% vs Dubai avg`, tone: vsCityPrice <= 0 ? 'text-gain' : 'text-muted-foreground' },
    { label: 'Median price / sqft', value: `AED ${b.medianPricePerSqft.toLocaleString()}`, note: 'DLD-benchmarked', tone: 'text-muted-foreground' },
    { label: 'Gross rental yield', value: `${b.avgRentalYield.toFixed(1)}%`, note: `${vsCityYield >= 0 ? '+' : ''}${vsCityYield} pts vs Dubai avg`, tone: vsCityYield >= 0 ? 'text-gain' : 'text-muted-foreground' },
    { label: 'YoY appreciation', value: `${b.yoyAppreciation > 0 ? '+' : ''}${b.yoyAppreciation.toFixed(1)}%`, note: b.trend, tone: trendTone[b.trend], capitalize: true },
    { label: 'Service charge', value: `AED ${b.avgServiceCharge}`, note: 'per sqft / year', tone: 'text-muted-foreground' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-5 sm:px-6 max-w-5xl mx-auto">
        <Link href="/areas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          All areas
        </Link>

        <div className="flex items-center gap-4 mb-5">
          <span className="text-5xl" aria-hidden="true">{emoji}</span>
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-muted-foreground">Dubai · Community</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">{b.area}</h1>
          </div>
        </div>

        <p className="text-lg text-muted-foreground max-w-2xl mb-6">
          {b.area} trades at an average of{' '}
          <span className="font-mono tabular text-foreground">AED {b.avgPricePerSqft.toLocaleString()}/sqft</span>,
          with a gross rental yield of{' '}
          <span className="font-mono tabular text-gain">{b.avgRentalYield.toFixed(1)}%</span> and{' '}
          <span className={`font-mono tabular ${trendTone[b.trend]}`}>{b.yoyAppreciation.toFixed(1)}%</span>{' '}
          year-on-year appreciation. The market is currently{' '}
          <span className={`inline-flex items-center gap-1 ${trendTone[b.trend]}`}>
            <TrendIcon className="w-4 h-4" />
            {b.trend}
          </span>.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="card-paper rounded-2xl p-4">
              <div className="font-mono tabular text-xl font-semibold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
              <div className={`text-[11px] mt-1.5 ${s.tone} ${s.capitalize ? 'capitalize' : ''}`}>{s.note}</div>
            </div>
          ))}
        </div>

        <div className="rule-gold w-24 mb-8" />

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={searchHref}>
            <Button size="lg" className="gap-2 glow-primary">
              <Search className="w-4 h-4" />
              Search {b.area} listings
            </Button>
          </Link>
          <Link href="/areas">
            <Button size="lg" variant="outline" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Compare all areas
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-muted-foreground mt-8 max-w-2xl">
          Figures are area-level benchmarks derived from Dubai Land Department transaction data, for research
          only — not a valuation of any specific property.
        </p>
      </div>
    </main>
  );
}
