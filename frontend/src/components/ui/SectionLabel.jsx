import { cn } from '../../lib/cn.js';

export default function SectionLabel({ children, pulse = true, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] px-5 py-2',
        className,
      )}
    >
      <span
        className={cn('h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]', pulse && 'mm-pulse-dot')}
        aria-hidden="true"
      />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--accent)]">{children}</span>
    </div>
  );
}
