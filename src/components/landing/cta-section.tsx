'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-28 px-5 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative max-w-4xl mx-auto text-center card-paper rounded-3xl px-6 py-16 sm:py-20 overflow-hidden"
      >
        <div className="rule-gold w-24 mx-auto mb-8" />
        <h2 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
          Buy in Dubai with
          <br />
          <span className="gradient-text italic">the numbers in front of you.</span>
        </h2>
        <p className="text-lg text-muted-foreground mt-6 mb-10 max-w-xl mx-auto">
          Stop scrolling thousands of listings. Get a shortlist matched to your brief — with the
          maths already done — in under a minute.
        </p>
        <Link href="/questionnaire">
          <Button size="lg" className="text-base px-8 py-6 rounded-xl gap-2 glow-primary">
            Start your search
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">Free · no sign-up</p>
      </motion.div>
    </section>
  );
}
