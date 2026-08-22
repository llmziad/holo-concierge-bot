'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { ProgressIndicator } from '@/components/questionnaire/progress-indicator';
import { StepGoal } from '@/components/questionnaire/step-goal';
import { StepBudget } from '@/components/questionnaire/step-budget';
import { StepLocation } from '@/components/questionnaire/step-location';
import { StepAreas } from '@/components/questionnaire/step-areas';
import { StepPropertyType } from '@/components/questionnaire/step-property-type';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TOTAL_STEPS = 5;

const stepComponents: Record<number, React.ComponentType> = {
  1: StepGoal,
  2: StepBudget,
  3: StepLocation,
  4: StepAreas,
  5: StepPropertyType,
};

export default function QuestionnairePage() {
  const router = useRouter();
  const { step, isComplete, prevStep, toSearchParams, reset } = useQuestionnaireStore();
  const hasReset = useRef(false);

  // On mount, reset any stale completed state so we start fresh
  useEffect(() => {
    if (!hasReset.current) {
      hasReset.current = true;
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to results when the user completes the questionnaire THIS session
  useEffect(() => {
    if (isComplete && hasReset.current) {
      const params = toSearchParams();
      const query = new URLSearchParams(params).toString();
      router.push(`/results?${query}`);
    }
  }, [isComplete, router, toSearchParams]);

  const StepComponent = stepComponents[step] || StepGoal;

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-8">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={prevStep} className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <span className="text-sm text-muted-foreground">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
