'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'gain' | 'none';
  hover?: boolean;
}

export function GlowCard({ children, className, glowColor = 'none', hover = true }: GlowCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-xl border border-border bg-card p-6 relative overflow-hidden',
        glowColor === 'primary' && 'glow-primary',
        glowColor === 'gain' && 'glow-gain',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
