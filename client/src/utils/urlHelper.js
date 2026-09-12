/**
 * Helper to dynamically resolve backend file and API URLs.
 * Eliminates hardcoded localhost and works seamlessly in both local and live/production environments.
 */

export const getBackendBaseUrl = () => {
  // If VITE_API_URL is configured in environment, use it as the source of truth
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/i, '');
  }

  // If in browser, dynamically fallback to the current window's origin
  if (typeof window !== 'undefined' && window.location) {
    // If running in development on port 5173 without VITE_API_URL set
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:5002`;
    }
    return window.location.origin;
  }

  return '';
};

/**
 * Resolves a file/avatar/media path to a full accessible URL.
 * Handles relative paths (/uploads/...), full URLs, data URLs, blob URLs.
 */
export const getBackendFileUrl = (path, fallback = null) => {
  if (!path) return fallback;

  // Already a full or special URL
  if (
    typeof path === 'string' &&
    (path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('blob:') ||
      path.startsWith('data:'))
  ) {
    return path;
  }

  const backendRoot = getBackendBaseUrl();
  const cleanPath = String(path).startsWith('/') ? path : `/${path}`;
  return `${backendRoot}${cleanPath}`;
};
