'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedNumber } from '@/components/shared/animated-number';
import { MapPin, LineChart, TrendingUp, Clock } from 'lucide-react';

// Honest, defensible figures — no unverifiable transaction counts.
const stats = [
  { icon: MapPin, value: 30, prefix: '', suffix: '+', label: 'Communities benchmarked', decimals: 0 },
  { icon: LineChart, value: 5, prefix: '', suffix: '-yr', label: 'ROI on every match', decimals: 0 },
  { icon: TrendingUp, value: 100, prefix: '0–', suffix: '', label: 'Fit score per listing', decimals: 0 },
  { icon: Clock, value: 60, prefix: '', suffix: 's', label: 'From answers to results', decimals: 0 },
];

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-16 px-5 sm:px-6 border-y border-border bg-card/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-gold mx-auto mb-3" aria-hidden="true" />
              <div className="font-serif text-3xl sm:text-4xl font-semibold mb-1">
                {stat.prefix}
                {isInView && (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                )}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
