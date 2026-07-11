/**
 * In-memory rate limiting middleware
 * Limits each IP to a configurable number of requests per time window.
 * No external dependencies required.
 */

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 60s)
 * @param {number} options.max - Max requests per window (default: 15)
 * @param {string} options.message - Error message when limit exceeded
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,   // 60 seconds
    max = 15,                // 15 requests per window
    message = 'Too many requests, please try again later.'
  } = options;

  return (req, res, next) => {
    // Use IP as the key (supports proxies via x-forwarded-for)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.connection?.remoteAddress || 
               req.ip || 
               'unknown';

    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || (now - entry.windowStart) > windowMs) {
      // First request or window expired — start new window
      rateLimitStore.set(ip, {
        count: 1,
        windowStart: now,
        windowMs
      });

      // Set rate limit headers
      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(max - 1));
      res.set('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));

      return next();
    }

    // Within the current window
    entry.count += 1;

    // Set rate limit headers
    const remaining = Math.max(0, max - entry.count);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil((entry.windowStart + windowMs) / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', String(retryAfter));

      return res.status(429).json({
        success: false,
        message,
        retryAfter
      });
    }

    next();
  };
};

module.exports = { createRateLimiter };
