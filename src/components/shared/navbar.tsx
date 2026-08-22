'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Emblem } from '@/components/shared/emblem';

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <Emblem className="w-8 h-8" />
            <span className="hidden sm:block text-sm font-medium tracking-tight">
              Dubai Real Estate Intelligence
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/areas"
              className="text-sm font-medium px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
            >
              Areas
            </Link>
            <Link
              href="/questionnaire"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
