import axios from "axios";

// Create axios instance with credentials
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // CRITICAL: Send cookies with every request
});

// Response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => {
    // Tokens are automatically stored in HTTP-only cookies by the server
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
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
