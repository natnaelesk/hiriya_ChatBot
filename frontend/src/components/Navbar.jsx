import { CLERK_ENABLED } from '../hooks/useAuthToken.js';
import universityLogo from '../assets/ambo-logo.png';
import { useAuthState, useSignOutAction } from '../hooks/useAuthToken.js';
import Button from './ui/Button.jsx';

export default function Navbar({
  onToggleSidebar,
  onNewChat,
  isStreaming,
  onOpenAuth,
}) {
  const { isSignedIn, user } = useAuthState();
  const signOut = useSignOutAction();
  const name = user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Student';

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_85%,transparent)] px-3 py-3 backdrop-blur-md sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden shrink-0"
            aria-label="Toggle chat list"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <img src={universityLogo} alt="Ambo University" className="h-8 w-8 object-contain" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-display text-lg text-[var(--foreground)]">Hiriya</div>
              <div className="truncate font-mono-ui text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                Ambo University
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onNewChat}
            disabled={isStreaming}
            className="hidden sm:inline-flex"
            aria-label="New chat"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            <span>New chat</span>
          </Button>

          {CLERK_ENABLED &&
            (isSignedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-[var(--muted-foreground)] sm:inline">
                  {name}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={() => onOpenAuth?.('sign-in')} showArrow>
                Sign in
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
