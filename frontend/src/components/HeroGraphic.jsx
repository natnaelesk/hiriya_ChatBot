/** Decorative hero visual — rotating ring, floating cards, gradient shapes. */
export default function HeroGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px] lg:max-w-none" aria-hidden="true">
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_65%)]" />

      <div className="mm-spin-slow absolute inset-0 rounded-full border border-dashed border-[color-mix(in_srgb,var(--accent)_25%,transparent)]" />

      <div className="mm-float-a absolute left-[6%] top-[18%] w-[42%] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
        <div className="mb-2 h-2 w-12 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]" />
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-[var(--muted)]" />
          <div className="h-1.5 w-4/5 rounded bg-[var(--muted)]" />
        </div>
      </div>

      <div className="mm-float-b absolute bottom-[20%] right-[4%] w-[38%] rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-xs font-bold text-white">
            AU
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-1.5 w-full rounded bg-[var(--muted)]" />
            <div className="mt-1 h-1.5 w-2/3 rounded bg-[var(--muted)]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[8%] left-[22%] grid grid-cols-3 gap-1.5 opacity-40">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        ))}
      </div>

      <div className="absolute right-[14%] top-[8%] h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] shadow-[var(--shadow-accent)]" />
    </div>
  );
}
