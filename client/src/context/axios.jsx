import axios from "axios";

// Create axios instance with credentials
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Send cookies with requests
});

// Add response interceptor to handle token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token (cookie will be sent automatically)
        const { data } = await instance.post('/auth/refresh-token');

        if (data.success) {
          // New tokens are set as cookies by the backend
          // Retry original request (new cookie will be sent automatically)
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear user data and redirect to login
        localStorage.removeItem("user");
        
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
