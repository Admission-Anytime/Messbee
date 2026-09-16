/**
 * Helper to dynamically resolve backend file and API URLs.
 * Eliminates hardcoded localhost and works seamlessly in both local and live/production environments.
 */

export const getBackendBaseUrl = () => {
  // 1. If VITE_API_URL is configured in environment, use it as the source of truth
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/i, '');
  }

  // 2. If running in browser
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;

    // Local development
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.protocol}//${host}:5002`;
    }

    // Production / Staging on messbee domain (e.g. tools.messbee.com -> webservices.messbee.com)
    if (host.endsWith('.messbee.com') || host === 'messbee.com') {
      return 'https://webservices.messbee.com';
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
    // If running in browser on messbee production, ensure localhost URLs get converted
    if (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      (path.includes('localhost:') || path.includes('127.0.0.1:'))
    ) {
      const liveBase = getBackendBaseUrl();
      const relativePart = path.replace(/^https?:\/\/[^/]+/i, '');
      return `${liveBase}${relativePart}`;
    }

    // If running in browser on localhost/dev and URL is from documents.messbee.com,
    // point to local backend uploads since local uploads are stored on this machine
    const isLocalhost = typeof window !== 'undefined' && window.location && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.')
    );
    if (isLocalhost && (path.includes('documents.messbee.com') || path.includes('messbee.com/uploads'))) {
      const filename = path.split('/').pop().split('?')[0];
      const liveBase = getBackendBaseUrl();
      return `${liveBase}/uploads/${filename}`;
    }

    return path;
  }

  const backendRoot = getBackendBaseUrl();
  const cleanPath = String(path).startsWith('/') ? path : `/${path}`;
  
  const finalUrl = `${backendRoot}${cleanPath}`;
  return finalUrl;
};

export const appendCacheBuster = (url) => {
  if (!url) return url;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};
