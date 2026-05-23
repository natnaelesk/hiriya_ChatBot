import { clerkMiddleware, getAuth } from '@clerk/express';
import { logger } from '../lib/logger.js';

/**
 * Non-rejecting Clerk middleware. Populates `req.auth.userId` if a valid Clerk
 * session token is present; otherwise leaves `req.auth` undefined so guest
 * paths still work. Routes that require auth must check `req.auth?.userId`
 * themselves (see chatsRouter).
 */
export function attachAuth() {
  if (!process.env.CLERK_SECRET_KEY) {
    logger.warn('CLERK_SECRET_KEY not set — auth middleware is a no-op.');
    return (req, _res, next) => {
      req.auth = undefined;
      next();
    };
  }

  const base = clerkMiddleware();

  return (req, res, next) => {
    base(req, res, (err) => {
      if (err) {
        logger.warn('clerk middleware error (treating as guest)', { error: err.message });
        req.auth = undefined;
        return next();
      }
      const auth = typeof req.auth === 'function' ? req.auth() : getAuth(req);
      if (auth && auth.userId) {
        req.auth = { userId: auth.userId, sessionId: auth.sessionId, claims: auth.sessionClaims };
      } else {
        req.auth = undefined;
      }
      next();
    });
  };
}
