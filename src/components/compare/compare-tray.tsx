'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCompareStore, MAX_COMPARE } from '@/store/compare-store';
import { useMounted } from '@/hooks/use-mounted';
import { X, Scale } from 'lucide-react';

export function CompareTray() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const mounted = useMounted();

  // Keep AnimatePresence mounted so the exit transition plays when the last
  // item is removed (gating the whole component on items.length would unmount
  // AnimatePresence and skip the animation).
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {items.length > 0 && (
      <motion.div
        key="compare-tray"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-3xl"
        role="region"
        aria-label="Compare tray"
      >
        <div className="card-paper rounded-2xl px-3 py-3 sm:px-4 flex items-center gap-3 shadow-lg">
          <span className="hidden sm:inline text-xs tracking-[0.12em] uppercase text-muted-foreground pl-1">
            Compare
          </span>

          <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {items.map((p) => (
              <div key={p.id} className="relative flex-shrink-0 group">
                <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-muted border border-border">
                  {p.images[0] && (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.title} from compare`}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: MAX_COMPARE - items.length }).map((_, i) => (
              <div
                key={`slot-${i}`}
                className="flex-shrink-0 w-14 h-11 rounded-lg border border-dashed border-border"
                aria-hidden="true"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={clear}
            className="hidden sm:inline text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              items.length >= 2
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground pointer-events-none'
            }`}
            aria-disabled={items.length < 2}
          >
            <Scale className="w-4 h-4" />
            Compare{items.length >= 2 ? ` (${items.length})` : ''}
          </Link>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
