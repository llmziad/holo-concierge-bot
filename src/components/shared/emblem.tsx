import { cn } from '@/lib/utils';

// Brand-neutral mark: a "market pulse" glyph on a teal tile. No letterform,
// so it carries no product name.
export function Emblem({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-primary',
        className
      )}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 11L6 7L9 9L14 4"
          stroke="var(--gold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="4" r="1.5" fill="var(--gold)" />
      </svg>
    </span>
  );
}
