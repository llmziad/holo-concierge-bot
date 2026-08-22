'use client';

import { useMemo, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatAed as aed, mortgageBreakdown } from '@/lib/finance';

interface MortgageCalculatorProps {
  price: number;
}

export function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(4.5);
  const [term, setTerm] = useState(25);

  const calc = useMemo(() => mortgageBreakdown(price, downPct, rate, term), [price, downPct, rate, term]);

  const controls = [
    { label: 'Down payment', value: downPct, set: setDownPct, min: 20, max: 60, step: 5, fmt: (v: number) => `${v}%` },
    { label: 'Interest rate', value: rate, set: setRate, min: 2, max: 8, step: 0.25, fmt: (v: number) => `${v.toFixed(2)}%` },
    { label: 'Term', value: term, set: setTerm, min: 5, max: 30, step: 1, fmt: (v: number) => `${v} yrs` },
  ];

  return (
    <div className="card-paper rounded-2xl p-5 sm:p-7">
      <div className="grid sm:grid-cols-[1fr_1.1fr] gap-6 sm:gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {controls.map((c) => (
            <div key={c.label}>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm text-foreground/80">{c.label}</label>
                <span className="font-mono tabular text-sm font-semibold text-primary">{c.fmt(c.value)}</span>
              </div>
              <Slider
                min={c.min}
                max={c.max}
                step={c.step}
                value={[c.value]}
                onValueChange={(v) => c.set(v[0])}
                aria-label={c.label}
              />
            </div>
          ))}
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm text-muted-foreground">Loan-to-value</span>
            <span className="font-mono tabular text-sm text-muted-foreground">{calc.ltv.toFixed(0)}%</span>
          </div>
        </div>

        {/* Outputs */}
        <div className="rounded-xl border border-border bg-secondary/40 p-5 flex flex-col justify-center">
          <div className="text-xs tracking-[0.12em] uppercase text-muted-foreground">Estimated monthly payment</div>
          <div className="font-mono tabular text-3xl sm:text-4xl font-semibold text-primary mt-1">
            {aed(calc.monthly)}
          </div>

          <div className="rule-gold my-5" />

          <dl className="space-y-2.5 text-sm">
            {[
              { k: 'Down payment', v: aed(calc.down) },
              { k: 'Loan amount', v: aed(calc.loan) },
              { k: 'DLD transfer (4%)', v: aed(calc.dldFee) },
              { k: 'Agency (2% + VAT)', v: aed(calc.agency) },
              { k: 'Mortgage registration', v: aed(calc.mortgageReg) },
              { k: 'Total interest (term)', v: aed(calc.totalInterest) },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{row.k}</dt>
                <dd className="font-mono tabular">{row.v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2.5 border-t border-border">
              <dt className="font-medium">Cash needed to close</dt>
              <dd className="font-mono tabular font-semibold text-base">{aed(calc.cashToClose)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Estimates only. Assumes a repayment mortgage; excludes life/property insurance, valuation, and
        bank arrangement fees. Non-resident minimum down payment is typically 20–25%.
      </p>
    </div>
  );
}
