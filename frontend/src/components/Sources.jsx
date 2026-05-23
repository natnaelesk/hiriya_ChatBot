import { useState } from 'react';

export default function Sources({ sources }) {
  const [open, setOpen] = useState(false);
  if (!Array.isArray(sources) || sources.length === 0) return null;

  const sourceLabel = (source) => (source?.type === 'web' ? 'Web' : 'Knowledge Base');
  const webSources = sources.filter((s) => s?.type === 'web' && s.url).slice(0, 4);

  return (
    <div className="mt-3 text-xs text-[var(--muted-foreground)]">
      {webSources.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]" />
          <div className="px-3 py-2">
          <div className="mb-1 font-mono-ui text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
            More info from the web
          </div>
          <div className="flex flex-wrap gap-1.5">
            {webSources.map((s) => (
              <a
                key={s.id ?? s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-full truncate rounded-lg border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 font-medium text-[var(--accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--muted))]"
                title={s.title ?? s.url}
              >
                {s.title ?? s.url}
              </a>
            ))}
          </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 font-medium shadow-sm transition-all duration-200 hover:border-[color-mix(in_srgb,var(--accent)_25%,transparent)] hover:shadow-md"
        aria-expanded={open}
      >
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H6z" />
        </svg>
        <span>{sources.length} source{sources.length === 1 ? '' : 's'}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ol className="mt-2 space-y-2">
          {sources.map((s, i) => (
            <li
              key={s.id ?? i}
              className="rounded-lg border border-[var(--pg-border)] bg-white px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      s.type === 'web'
                        ? 'bg-[var(--pg-tertiary)] text-[var(--pg-accent)]'
                        : 'bg-[var(--pg-muted)] text-[var(--pg-foreground)]'
                    }`}
                  >
                    {sourceLabel(s)}
                  </span>
                  <div className="mt-1 font-bold text-[var(--pg-foreground)]">
                    {s.type === 'web' && s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700"
                      >
                        {i + 1}. {s.title ?? s.url}
                      </a>
                    ) : (
                      <span>{i + 1}. {s.title ?? s.source ?? 'Untitled source'}</span>
                    )}
                  </div>
                </div>
                {typeof s.score === 'number' && (
                  <span
                    className="shrink-0 font-mono text-[10px] text-[var(--pg-muted-foreground)]"
                    title={s.type === 'web' ? 'Web result confidence' : 'Similarity score (higher = more relevant)'}
                  >
                    {s.score.toFixed(3)}
                  </span>
                )}
              </div>
              {s.snippet && (
                <p className="line-clamp-3 mt-1 text-[var(--pg-muted-foreground)]">
                  {s.snippet}
                </p>
              )}
              {s.source && s.source !== s.title && s.type !== 'web' && (
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  {s.source}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
