'use client';

import { motion } from 'framer-motion';
import { useQuestionnaireStore } from '@/store/questionnaire-store';
import { GoalType } from '@/types/questionnaire';
import { TrendingUp, Home, Blend } from 'lucide-react';

const goals = [
  {
    value: 'investment' as GoalType,
    icon: TrendingUp,
    title: 'Investment',
    description: 'Looking for ROI, rental yield, and capital appreciation',
  },
  {
    value: 'living' as GoalType,
    icon: Home,
    title: 'Living',
    description: 'Finding a home that fits your lifestyle and commute',
  },
  {
    value: 'both' as GoalType,
    icon: Blend,
    title: 'Both',
    description: 'A home to live in that also makes financial sense',
  },
];

export function StepGoal() {
  const { goal, setGoal, nextStep } = useQuestionnaireStore();

  const handleSelect = (value: GoalType) => {
    setGoal(value);
    setTimeout(() => nextStep(), 300);
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
          What&apos;s your goal?
        </h2>
        <p className="text-muted-foreground">
          This helps us prioritize what matters most in your search
        </p>
      </motion.div>

      <div className="grid gap-4">
        {goals.map((g, i) => (
          <motion.button
            key={g.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(g.value)}
            className={`flex items-center gap-5 p-6 rounded-xl border text-left transition-all ${
              goal === g.value
                ? 'border-primary bg-primary/10 glow-primary'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              goal === g.value ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <g.icon className={`w-6 h-6 ${goal === g.value ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{g.title}</h3>
              <p className="text-sm text-muted-foreground">{g.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
