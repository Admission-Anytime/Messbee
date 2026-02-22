import axios from "axios";

// Create axios instance with credentials
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add Authorization header
instance.interceptors.request.use(
  (config) => {
    // Get access token from localStorage (fallback if cookies don't work)
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      try {
        const { accessToken } = JSON.parse(tokens);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => {
    // Store tokens from response if present (for login/signup)
    if (response.data?.tokens) {
      localStorage.setItem('tokens', JSON.stringify(response.data.tokens));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage
        const tokens = localStorage.getItem('tokens');
        if (!tokens) {
          throw new Error('No tokens found');
        }

        const { refreshToken } = JSON.parse(tokens);
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // Try to refresh the token
        const { data } = await instance.post('/auth/refresh-token', { refreshToken });

        if (data.success && data.tokens) {
          // Store new tokens
          localStorage.setItem('tokens', JSON.stringify(data.tokens));
          
          // Update Authorization header for retry
          originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
          
          // Retry original request
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
        
        // Only redirect if not already on login/signup pages
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
