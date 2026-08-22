'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Goal', 'Budget', 'Location', 'Areas', 'Type'];

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isComplete = step < currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: isActive ? 1.25 : 1,
                  backgroundColor: isActive || isComplete
                    ? 'oklch(0.45 0.078 190)'
                    : 'oklch(0.885 0.013 82)',
                }}
                className="w-3 h-3 rounded-full"
              />
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {stepLabels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
}
