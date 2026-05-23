import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { CLERK_ENABLED } from '../hooks/useAuthToken.js';
import SectionLabel from './ui/SectionLabel.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Card from './ui/Card.jsx';
import { cn } from '../lib/cn.js';

const OAUTH_PROVIDERS = [
  {
    strategy: 'oauth_google',
    label: 'Continue with Google',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    strategy: 'oauth_microsoft',
    label: 'Continue with Microsoft',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
];

function errorMessage(err) {
  return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Authentication failed.';
}

function redirectUrls() {
  const url = `${window.location.origin}${window.location.pathname}`;
  return { redirectUrl: url, redirectUrlComplete: url };
}

export default function AuthModal({ mode, onClose, onModeChange }) {
  if (!mode || !CLERK_ENABLED) return null;
  return <AuthModalInner mode={mode} onClose={onClose} onModeChange={onModeChange} />;
}

function AuthModalInner({ mode, onClose, onModeChange }) {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = mode === 'sign-up';
  const authLoaded = isSignUp ? signUpLoaded : signInLoaded;
  const showSocial = !pendingVerification;

  const handleOAuth = async (strategy) => {
    if (!authLoaded) return;
    setLoading(true);
    setError('');
    try {
      const urls = redirectUrls();
      if (isSignUp) {
        await signUp.authenticateWithRedirect({ strategy, ...urls });
      } else {
        await signIn.authenticateWithRedirect({ strategy, ...urls });
      }
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await signIn.setActive({ session: result.createdSessionId });
        onClose?.();
      } else {
        setError('Additional verification is required for this account.');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoading(true);
    setError('');
    try {
      if (!pendingVerification) {
        await signUp.create({
          emailAddress: email,
          password,
          firstName: name || undefined,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === 'complete') {
          await signUp.setActive({ session: result.createdSessionId });
          onClose?.();
        } else {
          setError('Verification is not complete yet. Check the code and try again.');
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--foreground)]/50 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <Card featured className="relative w-full max-w-md shadow-xl" hover={false}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="Close"
        >
          ×
        </button>

        <div className="mb-5 pr-10">
          <SectionLabel className="mb-4">{isSignUp ? 'Create account' : 'Sign in'}</SectionLabel>
          <h2 className="font-display text-2xl text-[var(--foreground)]">
            {isSignUp ? 'Join Hiriya' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Save your conversations across devices.</p>
        </div>

        <div className="mb-5 flex rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1">
          {['sign-in', 'sign-up'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setError('');
                setPendingVerification(false);
                onModeChange?.(tab);
              }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200',
                (tab === 'sign-in' ? !isSignUp : isSignUp)
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)]',
              )}
            >
              {tab === 'sign-in' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {showSocial && (
          <div className="mb-4 space-y-2">
            {OAUTH_PROVIDERS.map((p) => (
              <Button
                key={p.strategy}
                variant="social"
                size="md"
                disabled={loading || !authLoaded}
                onClick={() => handleOAuth(p.strategy)}
              >
                {p.icon}
                <span>{p.label}</span>
              </Button>
            ))}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--card)] px-3 font-mono-ui text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)]">
                  or email
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
          {isSignUp && !pendingVerification && (
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Name
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
          )}
          {!pendingVerification ? (
            <>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Email
                <Input
                  className="mt-1.5"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ambo.edu.et"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Password
                <Input
                  className="mt-1.5"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </>
          ) : (
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Verification code
              <Input
                className="mt-1.5"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </label>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={loading} className="mm-btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] active:scale-[0.98] disabled:opacity-55">
            {loading
              ? 'Working…'
              : isSignUp
                ? pendingVerification
                  ? 'Verify email'
                  : 'Create account'
                : 'Sign in with email'}
          </button>
        </form>
      </Card>
    </div>
  );
}
