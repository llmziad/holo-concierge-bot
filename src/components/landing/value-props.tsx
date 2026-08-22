'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageSquare, Brain, LineChart } from 'lucide-react';

const props = [
  {
    icon: MessageSquare,
    title: 'Five questions',
    description:
      'Not fifty filters. Five that understand what you actually need — goal, budget, location, area, and type.',
  },
  {
    icon: Brain,
    title: 'AI-matched',
    description:
      'Every result is scored 0–100 against your brief. The model weighs market context, investment fit, and value.',
  },
  {
    icon: LineChart,
    title: 'Numbers on every card',
    description:
      'Yield, price-versus-market, and a five-year return — benchmarked to Dubai Land Department transaction data.',
  },
];

export function ValueProps() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 px-5 sm:px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-14"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
          <span className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">
            The difference
          </span>
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
          A concierge, not a terminal.
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Other platforms give you thousands of listings and raw data. You get a shortlist
          you can defend.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {props.map((prop, i) => (
          <motion.div
            key={prop.title}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="card-paper rounded-2xl p-7 h-full"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <prop.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">{prop.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{prop.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
