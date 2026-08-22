'use client';

import { motion } from 'framer-motion';
import { AIAnalysisResponse } from '@/types/ai';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface AIInsightsProps {
  analysis: AIAnalysisResponse | undefined;
  isLoading: boolean;
}

const recommendationStyles = {
  'strong-buy': { label: 'Strong Buy', color: 'text-gain', bg: 'bg-gain/10 border-gain/20' },
  'buy': { label: 'Buy', color: 'text-gain', bg: 'bg-gain/10 border-gain/20' },
  'hold': { label: 'Hold', color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
  'caution': { label: 'Caution', color: 'text-loss', bg: 'bg-loss/10 border-loss/20' },
};

export function AIInsights({ analysis, isLoading }: AIInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        AI analysis unavailable. Add your OpenAI API key to enable this feature.
      </div>
    );
  }

  const rec = recommendationStyles[analysis.recommendation] || recommendationStyles.hold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Recommendation badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${rec.bg}`}>
        <Brain className={`w-4 h-4 ${rec.color}`} />
        <span className={`text-sm font-bold ${rec.color}`}>AI Recommendation: {rec.label}</span>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>

      {/* Strengths & Risks */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gain/5 border border-gain/10">
          <h4 className="font-serif text-sm font-semibold tracking-tight text-gain mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 text-gain flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-loss/5 border border-loss/10">
          <h4 className="font-serif text-sm font-semibold tracking-tight text-loss mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Risks
          </h4>
          <ul className="space-y-2">
            {analysis.risks.map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 text-loss flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed sections */}
      <div className="space-y-4">
        {[
          { title: 'Price Assessment', content: analysis.priceAssessment },
          { title: 'Rental Potential', content: analysis.rentalPotential },
          { title: 'Long-Term Outlook', content: analysis.longTermOutlook },
        ].map((section) => (
          <div key={section.title}>
            <h4 className="font-serif text-sm font-semibold tracking-tight mb-1">{section.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
