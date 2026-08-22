'use client';

import { motion } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { DUBAI_AREAS, POPULAR_AREAS } from '@/lib/constants/dubai-areas';
import { useState } from 'react';

export function StepAreas() {
  const { preferredAreas, toggleArea, nextStep } = useQuestionnaireStore();
  const [showAll, setShowAll] = useState(false);

  const areas = showAll ? DUBAI_AREAS : POPULAR_AREAS;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Any preferred areas?
        </h2>
        <p className="text-muted-foreground">
          Optional — select communities you&apos;re interested in, or skip to see all
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {areas.map((area, i) => {
            const isSelected = preferredAreas.includes(area.slug);
            return (
              <motion.button
                key={area.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleArea(area.slug)}
                className={`relative flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary/15 border border-primary text-primary'
                    : 'bg-card border border-border text-foreground hover:border-primary/40'
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className="truncate">{area.name}</span>
              </motion.button>
            );
          })}
        </div>

        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="block mx-auto text-sm text-primary hover:underline mb-6"
          >
            Show all {DUBAI_AREAS.length} areas
          </button>
        )}

        {preferredAreas.length > 0 && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            {preferredAreas.length} area{preferredAreas.length > 1 ? 's' : ''} selected
          </div>
        )}

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={nextStep}>
            Skip — Show All Areas
          </Button>
          <Button onClick={nextStep} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
