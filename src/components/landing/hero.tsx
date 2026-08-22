'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

// A tiny hand-drawn sparkline — no chart dependency in the hero.
function Sparkline() {
  const pts = [14, 12, 15, 13, 18, 17, 22, 20, 26, 30];
  const w = 96;
  const h = 34;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      <path d={d} stroke="var(--gain)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Editorial grid pattern — faint ink hairlines on paper */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.245 0.014 68) 1px, transparent 1px), linear-gradient(90deg, oklch(0.245 0.014 68) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(120% 90% at 50% 0%, black, transparent 75%)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-10 items-center">
        {/* Editorial column */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-7"
          >
            <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
            <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
              Dubai Real Estate Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-serif font-semibold tracking-tight leading-[0.98] text-[3.25rem] sm:text-7xl lg:text-[5.25rem]"
          >
            Own Dubai,
            <br />
            <span className="gradient-text italic">underwritten.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Answer five questions. Get AI-matched listings with the yield, price-versus-market,
            and five-year return on every card — so you know what you&rsquo;re buying before you enquire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-9 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4"
          >
            <Link href="/questionnaire">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl gap-2 glow-primary">
                Start your search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">No sign-up · under 60 seconds</span>
          </motion.div>

          {/* Honest, defensible proof points */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0"
          >
            {[
              { value: '30', label: 'Areas benchmarked' },
              { value: '5-yr', label: 'ROI per listing' },
              { value: '<60s', label: 'To results' },
            ].map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <dd className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">{s.value}</dd>
                <dt className="text-xs text-muted-foreground mt-1">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Signature: the "intelligence card" — the product's promise, made visible */}
        <motion.div
          initial={{ opacity: 0, y: 28, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="card-paper rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.14em] uppercase text-muted-foreground">Dubai Marina · 2 BR</p>
                <p className="mt-1 font-serif text-2xl font-semibold leading-tight">Marina Gate</p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gain/10 text-gain text-xs font-medium px-2.5 py-1">
                <TrendingUp className="w-3 h-3" />
                4% below market
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-mono tabular text-3xl font-semibold tracking-tight">AED 2.45M</p>
                <p className="font-mono tabular text-xs text-muted-foreground mt-1">1,180 /sqft</p>
              </div>
              <Sparkline />
            </div>

            <div className="rule-gold my-5" />

            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                { k: 'Gross yield', v: '6.4%', tone: 'text-gain' },
                { k: '5-yr ROI', v: '58%', tone: 'text-gain' },
                { k: 'Appreciation', v: '6.0%', tone: 'text-foreground' },
              ].map((m) => (
                <div key={m.k} className="rounded-lg border border-border bg-secondary/40 py-2.5">
                  <dd className={`font-mono tabular text-base font-semibold ${m.tone}`}>{m.v}</dd>
                  <dt className="text-[10px] text-muted-foreground mt-0.5">{m.k}</dt>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-[10px] text-muted-foreground text-center">Illustrative — figures shown per matched listing</p>
          </div>

          {/* soft warm halo behind the card */}
          <div
            className="absolute -inset-6 -z-10 rounded-[2rem] blur-2xl opacity-60"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(60% 60% at 30% 20%, oklch(0.45 0.078 190 / 0.14), transparent 70%), radial-gradient(60% 60% at 80% 90%, oklch(0.66 0.104 76 / 0.16), transparent 70%)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
