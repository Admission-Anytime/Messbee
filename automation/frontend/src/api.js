import axios from 'axios';
import useAuthStore from './store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
