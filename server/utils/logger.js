/**
 * Production-safe logger utility.
 * In production (NODE_ENV=production), only errors are logged to stderr.
 * In development, full verbose output is shown.
 */

const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => { if (isDev) console.log(...args); },
  info: (...args) => { if (isDev) console.log('[INFO]', ...args); },
  warn: (...args) => { if (isDev) console.warn('[WARN]', ...args); },
  // Errors always log (server-side only, never visible to end users)
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => { if (isDev) console.log('[DEBUG]', ...args); },
};

module.exports = logger;
