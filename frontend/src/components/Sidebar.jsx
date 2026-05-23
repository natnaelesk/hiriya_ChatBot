import { useMemo, useState } from 'react';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import { cn } from '../lib/cn.js';

function relativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function Sidebar({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  loading,
  enabled,
  isSignedIn,
  onOpenAuth,
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }, [chats, search]);

  const panel = (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-sm md:m-0 md:h-full md:rounded-none">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <span className="font-display text-xl text-[var(--foreground)]">Chats</span>
        <Button variant="primary" size="sm" onClick={onNewChat}>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          <span>New</span>
        </Button>
      </div>

      {enabled && (
        <div className="border-b border-[var(--border)] px-3 py-3">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="h-10 text-sm"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {!enabled ? (
          <EmptyHint>
            <p>
              You&apos;re chatting as a <strong>guest</strong>.
            </p>
            <p className="mt-1">Sign in to sync history across devices.</p>
          </EmptyHint>
        ) : !isSignedIn ? (
          <EmptyHint>
            <p>Sign in to see your chat history.</p>
            <Button variant="primary" size="sm" className="mt-3 w-full" onClick={() => onOpenAuth?.()}>
              Sign in
            </Button>
          </EmptyHint>
        ) : loading ? (
          <EmptyHint>Loading…</EmptyHint>
        ) : filtered.length === 0 ? (
          <EmptyHint>No chats yet. Start a conversation!</EmptyHint>
        ) : (
          <ul className="space-y-1">
            {filtered.map((c) => {
              const active = c.id === activeChatId;
              return (
                <li key={c.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectChat?.(c.id);
                      }
                    }}
                    className={cn(
                      'group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-all duration-200',
                      active
                        ? 'border border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--card))] shadow-[var(--shadow-accent)]'
                        : 'border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted)]',
                    )}
                    onClick={() => onSelectChat?.(c.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.title || 'New conversation'}</div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        {relativeTime(c.updated_at ?? c.created_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this chat?')) onDeleteChat?.(c.id);
                      }}
                      className="rounded-lg p-1.5 text-[var(--muted-foreground)] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      aria-label="Delete chat"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-1 1v1H4a1 1 0 100 2h12a1 1 0 100-2h-4V3a1 1 0 00-1-1H9zm-3 6a1 1 0 011 1v7a1 1 0 102 0V9a1 1 0 112 0v7a1 1 0 102 0V9a1 1 0 112 0v7a3 3 0 01-3 3H9a3 3 0 01-3-3V9a1 1 0 010 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full md:flex">{panel}</div>
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-y-0 left-0 z-50 flex shadow-xl">{panel}</div>
      </div>
    </>
  );
}

function EmptyHint({ children }) {
  return (
    <div className="m-1 rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)] px-3 py-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
      {children}
    </div>
  );
}
