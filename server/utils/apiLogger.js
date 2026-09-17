const fs = require('fs');
const path = require('path');

/**
 * API Logger Utility
 * Logs all WhatsApp API calls to a plain-text append-only log file
 */

const LOGS_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOGS_DIR, 'whatsapp_api_calls.log');

/**
 * Ensure logs directory exists
 */
const ensureLogsDir = () => {
  if (!fs.existsSync(LOGS_DIR)) {
    try {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    } catch (err) {
      console.error('❌ Failed to create logs directory:', err.message);
    }
  }
};

/**
 * Format a log entry with timestamp, method, path, user info, request/response details
 */
const formatLogEntry = (logData) => {
  const {
    timestamp = new Date().toISOString(),
    method,
    path,
    userId,
    userName,
    statusCode,
    requestBody,
    responseBody,
    responseStatus,
    errorMessage,
    headers,
  } = logData;

  let entry = `[${timestamp}] ${method} ${path}`;

  if (userId) {
    entry += ` | User: ${userId}`;
  }
  if (userName) {
    entry += ` (${userName})`;
  }

  if (headers) {
    const authHeader = headers['authorization'] ? '[AUTH_PRESENT]' : '[NO_AUTH]';
    entry += ` | Auth: ${authHeader}`;
  }

  if (requestBody) {
    // Log request body, but mask sensitive fields
    const maskedBody = maskSensitiveFields(requestBody);
    entry += ` | Request: ${JSON.stringify(maskedBody)}`;
  }

  if (responseStatus) {
    entry += ` | Response Status: ${responseStatus}`;
  }
  if (statusCode) {
    entry += ` | HTTP Status: ${statusCode}`;
  }

  if (responseBody) {
    const maskedResponse = maskSensitiveFields(responseBody);
    entry += ` | Response: ${JSON.stringify(maskedResponse)}`;
  }

  if (errorMessage) {
    entry += ` | ERROR: ${errorMessage}`;
  }

  return entry + '\n';
};

/**
 * Mask sensitive fields in request/response bodies to prevent token/password leaks
 */
const maskSensitiveFields = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sensitiveKeys = ['accessToken', 'token', 'password', 'pin', 'secret', 'authorization'];
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };

  const maskValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return maskValue(value);
    }
    if (typeof value === 'string' && value.length > 4) {
      return value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 8));
    }
    return '[REDACTED]';
  };

  const walk = (node) => {
    if (typeof node !== 'object' || node === null) return;
    for (const key in node) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        node[key] = maskValue(node[key]);
      } else if (typeof node[key] === 'object') {
        walk(node[key]);
      }
    }
  };

  walk(copy);
  return copy;
};

/**
 * Append a log entry to the API call log file
 */
const logAPICall = (logData) => {
  try {
    ensureLogsDir();
    const entry = formatLogEntry(logData);
    fs.appendFileSync(LOG_FILE, entry, 'utf8');
  } catch (err) {
    // Non-fatal: log to console but don't break the API
    console.error('⚠️  Failed to write to API log:', err.message);
  }
};

/**
 * Get the path to the API log file
 */
const getLogFilePath = () => {
  return LOG_FILE;
};

/**
 * Read recent log entries (for testing/debugging)
 */
const getRecentLogs = (lines = 50) => {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    return content.split('\n').filter(Boolean).slice(-lines);
  } catch (err) {
    console.error('❌ Failed to read log file:', err.message);
    return [];
  }
};

/**
 * Clear the log file (for testing only)
 */
const clearLogs = () => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
  } catch (err) {
    console.error('❌ Failed to clear log file:', err.message);
  }
};

// ─── GENERAL API LOG (all routes) ────────────────────────────────────────────

const GENERAL_LOG_FILE = path.join(LOGS_DIR, 'api.log');

/**
 * Log any generic HTTP request to logs/api.log
 * Safe: wrapped in try/catch, never throws
 */
const logRequest = (data) => {
  try {
    ensureLogsDir();
    const {
      method = '-',
      url = '-',
      statusCode = '-',
      durationMs = '-',
      userId = null,
      ip = '-',
      errorMessage = null,
      stack = null,
    } = data;

    const ts = new Date().toISOString();
    const user = userId ? ` | user:${userId}` : '';
    const isError = errorMessage || (typeof statusCode === 'number' && statusCode >= 400);
    const prefix = isError ? '[ERROR] ' : '';
    const errPart = errorMessage ? ` | ERR: ${errorMessage}` : '';

    let line = `[${ts}] ${prefix}${method} ${url} ${statusCode} ${durationMs}ms${user} | ip:${ip}${errPart}\n`;

    // Append stack trace on next lines (indented) for easy reading
    if (stack) {
      const indented = stack.split('\n').map(l => '    ' + l).join('\n');
      line += indented + '\n';
    }

    fs.appendFileSync(GENERAL_LOG_FILE, line, 'utf8');
  } catch (_) {
    // Silent fail — logging should never crash the server
  }
};

/**
 * Express middleware — attach to app BEFORE routes in server.js
 * Uses res.on('finish') so it only writes AFTER response is sent.
 * It never blocks, never modifies req/res, never throws.
 *
 * Usage in server.js:
 *   const { globalLogMiddleware } = require('./utils/apiLogger');
 *   app.use(globalLogMiddleware);
 */
const globalLogMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    try {
      logRequest({
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        userId: req.user ? (req.user._id || req.user.id || null) : null,
        ip: req.ip || (req.headers['x-forwarded-for']) || '-',
      });
    } catch (_) {
      // Silent fail
    }
  });

  next(); // Always call next — this middleware does nothing to the request/response
};

// ─── AXIOS INTERCEPTOR (External outgoing API calls) ─────────────────────────

/**
 * Call this ONCE in server.js to intercept ALL axios calls globally.
 * Logs every outgoing HTTP request (to Meta, Razorpay, any 3rd party) to api.log.
 * Uses [OUT] prefix so it's easy to distinguish from incoming requests.
 * Never throws — interceptor errors are silently swallowed.
 */
const setupAxiosInterceptors = () => {
  try {
    const axios = require('axios');

    // Request interceptor — fired just before the external call goes out
    axios.interceptors.request.use(
      (config) => {
        // Attach start time on the config so we can calc duration in response
        config._logStartTime = Date.now();
        return config; // Must return config unchanged
      },
      (error) => Promise.reject(error) // Don't swallow request errors
    );

    // Response interceptor — fired after external call returns
    axios.interceptors.response.use(
      (response) => {
        try {
          const duration = response.config._logStartTime
            ? Date.now() - response.config._logStartTime
            : '-';
          const url = response.config.baseURL
            ? response.config.baseURL + (response.config.url || '')
            : response.config.url || '-';
          const ts = new Date().toISOString();
          const line = `[${ts}] [OUT] ${(response.config.method || 'GET').toUpperCase()} ${url} ${response.status} ${duration}ms\n`;
          ensureLogsDir();
          fs.appendFileSync(GENERAL_LOG_FILE, line, 'utf8');
        } catch (_) {
          // Silent fail
        }
        return response; // Must return response unchanged
      },
      (error) => {
        try {
          const config = error.config || {};
          const duration = config._logStartTime ? Date.now() - config._logStartTime : '-';
          const url = config.baseURL
            ? config.baseURL + (config.url || '')
            : config.url || '-';
          const status = error.response ? error.response.status : 'ERR';
          const msg = error.message || 'Unknown error';
          const ts = new Date().toISOString();
          const line = `[${ts}] [ERROR][OUT] ${(config.method || 'GET').toUpperCase()} ${url} ${status} ${duration}ms | ERR: ${msg}\n`;
          ensureLogsDir();
          fs.appendFileSync(GENERAL_LOG_FILE, line, 'utf8');
        } catch (_) {
          // Silent fail
        }
        return Promise.reject(error); // Must re-throw so original error handling works
      }
    );
  } catch (_) {
    // If axios is not installed, skip silently
  }
};

module.exports = {
  logAPICall,
  getLogFilePath,
  getRecentLogs,
  clearLogs,
  formatLogEntry,
  logRequest,
  globalLogMiddleware,
  setupAxiosInterceptors,
};
