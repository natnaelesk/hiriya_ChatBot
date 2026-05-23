import { cn } from '../../lib/cn.js';

export default function Card({ featured = false, hover = true, className, children, ...props }) {
  if (featured) {
    return (
      <div className={cn('rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] p-[2px]', className)} {...props}>
        <div className="h-full w-full rounded-[10px] bg-[var(--card)] p-6">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-md',
        hover &&
          'transition-all duration-300 ease-out hover:shadow-xl hover:bg-gradient-to-br hover:from-[color-mix(in_srgb,var(--accent)_3%,transparent)] hover:to-transparent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
