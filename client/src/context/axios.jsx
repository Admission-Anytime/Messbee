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

// 3. REQUEST INTERCEPTOR (Attach Bearer token from localStorage):
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (typeof config.headers?.set === "function") {
        if (!config.headers.get("Authorization") && !config.headers.get("authorization")) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      } else {
        config.headers = config.headers || {};
        if (!config.headers.Authorization && !config.headers.authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. RESPONSE INTERCEPTOR (For automatic token refresh):
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If account is pending admin approval (403), force logout immediately
    if (error.response?.status === 403 && error.response?.data?.pendingApproval) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet, try to refresh token
    // BUT skip refresh for login/signup endpoints (they should return 401 normally)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");
        // Try to refresh the token using stored refresh token or cookie
        const { data } = await instance.post('/auth/refresh-token', {
          refreshToken: storedRefreshToken
        });

        if (data.success) {
          const newAccess = data.tokens?.accessToken || data.accessToken || data.data?.accessToken || data.data?.tokens?.accessToken;
          const newRefresh = data.tokens?.refreshToken || data.refreshToken || data.data?.refreshToken || data.data?.tokens?.refreshToken;
          if (newAccess) localStorage.setItem("token", newAccess);
          if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
          
          if (newAccess) {
            if (typeof originalRequest.headers?.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
            } else {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            }
          }
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

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