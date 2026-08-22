'use client';

import { useMemo } from 'react';
import { DLDTransaction } from '@/types/transaction';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface TransactionHistoryProps {
  transactions: DLDTransaction[];
  areaName: string;
}

function generateDummyTransactions(areaName: string): DLDTransaction[] {
  const types = ['apartment', 'apartment', 'apartment', 'villa', 'townhouse', 'penthouse'];
  const now = Date.now();

  return Array.from({ length: 8 }, (_, i) => {
    const size = 800 + Math.round(Math.random() * 2200);
    const pricePerSqft = 1200 + Math.round(Math.random() * 1800);
    const value = size * pricePerSqft;
    const daysAgo = 7 + Math.round(Math.random() * 180);

    return {
      id: `sample-${i}`,
      transactionDate: new Date(now - daysAgo * 86400000).toISOString(),
      transactionType: 'sale' as const,
      propertyType: types[i % types.length],
      area: areaName,
      transactionValue: Math.round(value / 1000) * 1000,
      propertySize: size,
      pricePerSqft,
    };
  }).sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export function TransactionHistory({ transactions, areaName }: TransactionHistoryProps) {
  const isSample = transactions.length === 0;
  const displayTransactions = useMemo(
    () => (isSample ? generateDummyTransactions(areaName) : transactions),
    [isSample, areaName, transactions]
  );

  return (
    <div className="-mx-2 sm:mx-0 overflow-x-auto">
      {isSample && (
        <div className="flex items-center gap-2 mb-3 px-2 sm:px-0">
          <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
            Sample Data
          </Badge>
          <span className="text-xs text-muted-foreground">
            Illustrative transactions for {areaName}
          </span>
        </div>
      )}
      <table className="w-full text-xs sm:text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Date</th>
            <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Type</th>
            <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">Price</th>
            <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">Size</th>
            <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">AED/sqft</th>
          </tr>
        </thead>
        <tbody className={isSample ? 'opacity-60' : ''}>
          {displayTransactions.slice(0, 15).map((txn, i) => (
            <motion.tr
              key={txn.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-border/50 hover:bg-muted/30"
            >
              <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap font-mono tabular">
                {new Date(txn.transactionDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: '2-digit',
                })}
              </td>
              <td className="py-2.5 px-2 capitalize">{txn.propertyType}</td>
              <td className="py-2.5 px-2 text-right font-medium whitespace-nowrap font-mono tabular">
                {(txn.transactionValue / 1000000).toFixed(2)}M
              </td>
              <td className="py-2.5 px-2 text-right text-muted-foreground whitespace-nowrap font-mono tabular">
                {txn.propertySize.toLocaleString()}
              </td>
              <td className="py-2.5 px-2 text-right font-medium text-primary font-mono tabular">
                {txn.pricePerSqft.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
