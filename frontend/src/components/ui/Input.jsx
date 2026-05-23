import { cn } from '../../lib/cn.js';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'mm-input h-12 w-full rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--muted)_40%,transparent)] px-4 text-[var(--foreground)] placeholder:text-[color-mix(in_srgb,var(--muted-foreground)_50%,transparent)] transition-all duration-200',
        'focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]',
        className,
      )}
      {...props}
    />
  );
}
