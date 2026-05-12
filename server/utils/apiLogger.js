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

module.exports = {
  logAPICall,
  getLogFilePath,
  getRecentLogs,
  clearLogs,
  formatLogEntry,
};
