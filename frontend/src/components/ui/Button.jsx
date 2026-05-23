import { cn } from '../../lib/cn.js';

const variants = {
  primary:
    'mm-btn-primary border-0 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] active:scale-[0.98]',
  secondary:
    'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)] hover:bg-[var(--muted)] hover:shadow-md active:scale-[0.98]',
  ghost: 'border-0 bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
  social:
    'w-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)] hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)]',
};

const sizes = {
  sm: 'h-10 min-h-10 px-3 text-sm rounded-lg',
  md: 'h-12 min-h-12 px-5 text-sm rounded-xl',
  icon: 'h-11 w-11 min-h-11 p-0 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  showArrow,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        'group inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-out disabled:opacity-55 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.06-1.06l5.5 5.5a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 11-1.06-1.06l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
