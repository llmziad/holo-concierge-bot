'use client';

import { motion } from 'framer-motion';
import { InvestmentMetrics } from '@/types/property';
import { AnimatedNumber } from '@/components/shared/animated-number';
import { TrendingUp, Percent, Calendar, Coins } from 'lucide-react';

interface InvestmentMetricsPanelProps {
  metrics: InvestmentMetrics;
  price: number;
}

export function InvestmentMetricsPanel({ metrics, price }: InvestmentMetricsPanelProps) {
  const cards = [
    {
      icon: Percent,
      label: 'Net rental yield',
      value: metrics.netRentalYield,
      suffix: '%',
      decimals: 1,
      accent: metrics.netRentalYield > 6,
      sublabel: `AED ${metrics.estimatedMonthlyRent.toLocaleString()}/mo`,
    },
    {
      icon: TrendingUp,
      label: 'Capital appreciation',
      value: metrics.capitalAppreciation,
      suffix: '%',
      decimals: 1,
      accent: true,
      sublabel: 'Annual estimate',
    },
    {
      icon: Calendar,
      label: '5-year projected ROI',
      value: metrics.fiveYearROI,
      suffix: '%',
      decimals: 0,
      accent: metrics.fiveYearROI > 40,
      sublabel: `≈ AED ${Math.round((price * 1.06 * metrics.fiveYearROI) / 100).toLocaleString()} gain`,
    },
    {
      icon: Coins,
      label: 'Est. annual rent',
      value: metrics.estimatedAnnualRent,
      suffix: '',
      decimals: 0,
      accent: false,
      prefix: 'AED ',
      sublabel: `${metrics.grossRentalYield.toFixed(1)}% gross yield`,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-paper rounded-2xl p-4"
          >
            <card.icon
              className={`w-4 h-4 mb-3 ${card.accent ? 'text-gain' : 'text-muted-foreground'}`}
            />
            <div
              className={`font-mono tabular text-xl sm:text-2xl font-semibold mb-1 ${
                card.accent ? 'text-gain' : 'text-foreground'
              }`}
            >
              {card.prefix}
              <AnimatedNumber value={card.value} suffix={card.suffix} decimals={card.decimals} />
            </div>
            <div className="text-[11px] sm:text-xs text-foreground/70">{card.label}</div>
            <div className="font-mono tabular text-[11px] text-muted-foreground mt-1">
              {card.sublabel}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
        Estimates from area benchmarks — assume ~5% vacancy and ~1% annual maintenance. The 5-year ROI
        compounds appreciation and includes ~6% buying and ~2% exit costs; financing is excluded.
        Illustrative, not investment advice.
      </p>
    </div>
  );
}
