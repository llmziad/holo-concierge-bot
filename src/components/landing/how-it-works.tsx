'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Answer five questions',
    description: 'Your goal, budget, preferred location, areas, and property type. Takes about thirty seconds.',
  },
  {
    number: '02',
    title: 'The model reads the market',
    description: 'It searches listings, benchmarks each against area transaction data, estimates the return, and scores the fit.',
  },
  {
    number: '03',
    title: 'Get a shortlist you can defend',
    description: 'AI-scored properties with a market badge, investment metrics, and a plain-English read on the price — on every card.',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-5 sm:px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-14"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
          <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
            How it works
          </span>
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
          Three steps. Under a minute.
        </h2>
      </motion.div>

      <div className="relative">
        <div className="absolute left-8 top-4 bottom-4 w-px bg-border hidden md:block" aria-hidden="true" />

        <div className="space-y-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.18 }}
              className="flex gap-6 md:gap-8 items-start"
            >
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl border border-border bg-card flex items-center justify-center">
                  <span className="font-serif text-2xl font-semibold text-primary">{step.number}</span>
                </div>
              </div>
              <div className="pt-2.5">
                <h3 className="font-serif text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
