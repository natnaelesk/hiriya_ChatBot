import { logger } from '../lib/logger.js';

export function notFound(req, res, _next) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

// Express 4 4-arg signature is required so it's recognised as an error handler.
export function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 500) {
    logger.error('unhandled error', { path: req.originalUrl, message: err.message, stack: err.stack });
  } else {
    logger.warn('handled error', { path: req.originalUrl, message: err.message });
  }
  res.status(status).json({ error: err.expose ? err.message : 'Internal Server Error' });
}
