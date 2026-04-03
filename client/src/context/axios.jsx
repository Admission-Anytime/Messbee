import axios from "axios";

// 1. RESOLVE BASE URL:
// It will try to use your .env variable first. 
// If it can't find it, it safely forces the connection to your backend on port 5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

// 2. CREATE AXIOS INSTANCE:
const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Send cookies with every request
});

// 3. RESPONSE INTERCEPTOR (For automatic token refresh):
instance.interceptors.response.use(
  (response) => {
    // Tokens are automatically stored in HTTP-only cookies by the server
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    // BUT skip refresh for login/signup endpoints (they should return 401 normally)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the refresh token cookie
        const { data } = await instance.post('/auth/refresh-token');

        if (data.success) {
          // New tokens are automatically set as cookies by the server
          // Retry the original request
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        localStorage.removeItem("user");

        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
          console.log('Session expired - redirecting to login');
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors or already retried requests, just reject
    return Promise.reject(error);
  }
);

export default instance;