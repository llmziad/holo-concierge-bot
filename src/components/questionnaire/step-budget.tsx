'use client';

import { motion } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const QUICK_BUDGETS = [
  { label: '0.5M - 1M', min: 500000, max: 1000000 },
  { label: '1M - 2M', min: 1000000, max: 2000000 },
  { label: '2M - 4M', min: 2000000, max: 4000000 },
  { label: '4M - 7M', min: 4000000, max: 7000000 },
  { label: '7M - 10M+', min: 7000000, max: 10000000 },
];

function formatPrice(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

export function StepBudget() {
  const { budgetMin, budgetMax, setBudget, nextStep } = useQuestionnaireStore();

  const handleSliderChange = (values: number[]) => {
    setBudget(values[0], values[1]);
  };

  const handleQuickSelect = (min: number, max: number) => {
    setBudget(min, max);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          What&apos;s your budget?
        </h2>
        <p className="text-muted-foreground">
          Set your range — we&apos;ll find the best value within it
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-8"
      >
        {/* Price display */}
        <div className="text-center p-6 rounded-xl card-paper">
          <div className="text-xs tracking-[0.14em] uppercase text-muted-foreground mb-2">Budget range</div>
          <div className="font-mono tabular text-2xl sm:text-3xl font-semibold">
            <span className="text-primary">AED {formatPrice(budgetMin)}</span>
            <span className="text-muted-foreground mx-3">—</span>
            <span className="text-primary">AED {formatPrice(budgetMax)}</span>
          </div>
        </div>

        {/* Dual thumb slider */}
        <div className="px-4">
          <Slider
            min={500000}
            max={10000000}
            step={100000}
            value={[budgetMin, budgetMax]}
            onValueChange={handleSliderChange}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>AED 500K</span>
            <span>AED 10M+</span>
          </div>
        </div>

        {/* Quick select chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_BUDGETS.map((qb) => (
            <button
              key={qb.label}
              onClick={() => handleQuickSelect(qb.min, qb.max)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                budgetMin === qb.min && budgetMax === qb.max
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {qb.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={nextStep} size="lg" className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
