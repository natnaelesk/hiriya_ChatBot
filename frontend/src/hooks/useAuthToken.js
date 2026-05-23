// Safe accessors for Clerk auth.
//
// `main.jsx` mounts <ClerkProvider> only when VITE_CLERK_PUBLISHABLE_KEY is
// defined at build time. We read the same env at module load to decide whether
// to call Clerk hooks (which would throw if the provider isn't mounted) or
// return stub values. This keeps the React hook order stable across renders
// regardless of auth configuration.
import { useCallback } from 'react';
import { useAuth as clerkUseAuth, useUser as clerkUseUser } from '@clerk/clerk-react';

export const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const stubAuth = { isLoaded: true, isSignedIn: false, userId: null, getToken: async () => null };
const stubUser = { isLoaded: true, isSignedIn: false, user: null };

function safeUseAuth() {
  if (!CLERK_ENABLED) return stubAuth;
  return clerkUseAuth();
}

function safeUseUser() {
  if (!CLERK_ENABLED) return stubUser;
  return clerkUseUser();
}

/**
 * Returns a stable async function that resolves to a Clerk JWT (or null).
 */
export function useGetToken() {
  const { isLoaded, getToken } = safeUseAuth();
  return useCallback(
    async (...args) => {
      if (!CLERK_ENABLED || !isLoaded || typeof getToken !== 'function') return null;
      try {
        return await getToken(...args);
      } catch {
        return null;
      }
    },
    [isLoaded, getToken],
  );
}

export function useAuthState() {
  const auth = safeUseAuth();
  const user = safeUseUser();
  return {
    enabled: CLERK_ENABLED,
    isLoaded: auth.isLoaded && user.isLoaded,
    isSignedIn: Boolean(auth.isSignedIn),
    userId: auth.userId ?? null,
    user: user.user ?? null,
  };
}

export function useSignOutAction() {
  const auth = safeUseAuth();
  return useCallback(async () => {
    if (!CLERK_ENABLED || typeof auth.signOut !== 'function') return;
    await auth.signOut();
  }, [auth]);
}
