'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AIProcessingStage } from '@/types/ai';

const STAGES: AIProcessingStage[] = [
  { id: 'searching', label: 'Searching Dubai listings', status: 'pending' },
  { id: 'analyzing', label: 'Benchmarking against area data', status: 'pending' },
  { id: 'matching', label: 'Scoring each listing against your brief', status: 'pending' },
  { id: 'preparing', label: 'Preparing your shortlist', status: 'pending' },
];

export function AIProcessingScreen() {
  const [stages, setStages] = useState(STAGES);

  useEffect(() => {
    const timers = STAGES.map((_, i) =>
      setTimeout(() => {
        setStages((prev) =>
          prev.map((s, j) => ({
            ...s,
            status: j < i ? 'complete' : j === i ? 'active' : 'pending',
          }))
        );
      }, i * 1200 + 500)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label="Preparing your shortlist"
    >
      {/* Calm concentric pulse — the "market read" in motion */}
      <div className="relative w-28 h-28 mb-12" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.8, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-6 rounded-full bg-primary/10" />
        <motion.div
          className="absolute inset-10 rounded-full bg-primary flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <span className="w-2 h-2 rounded-full bg-gold" />
        </motion.div>
      </div>

      <p className="font-serif text-2xl font-semibold mb-8">Reading the market</p>

      {/* Stages */}
      <div className="space-y-4 w-full max-w-sm">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              {stage.status === 'complete' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-gain flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-background" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              ) : stage.status === 'active' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent"
                />
              ) : (
                <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
              )}
            </div>
            <span className={`text-sm ${
              stage.status === 'active' ? 'text-foreground font-medium' :
              stage.status === 'complete' ? 'text-muted-foreground' :
              'text-muted-foreground/50'
            }`}>
              {stage.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
