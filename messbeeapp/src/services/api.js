import axios from 'axios';
import { Platform } from 'react-native';

// Backend runs on port 5002
// 192.168.1.12 allows physical phones connected over local Wi-Fi to connect
// 10.0.2.2 is the Android emulator loopback alias
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.1.12:5002/api'
    : 'http://localhost:5002/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let userToken = null;

export const setAuthToken = (token) => {
  userToken = token;
};

export const getAuthToken = () => userToken;

api.interceptors.request.use(
  (config) => {
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== AUTH SERVICE (Exact same endpoints as Web) ====================
export const authService = {
  // Request OTP for login
  requestLoginOTP: async (email) => {
    const { data } = await api.post('/auth/login/request-otp', { email });
    return data;
  },

  // Verify OTP for login
  verifyLoginOTP: async (email, otp) => {
    const { data } = await api.post('/auth/login/verify-otp', { email, otp });
    if (data.accessToken || data.token) {
      setAuthToken(data.accessToken || data.token);
    }
    return data;
  },

  // Resend OTP
  resendOTP: async (email, purpose = 'login') => {
    const { data } = await api.post('/auth/resend-otp', { email, purpose });
    return data;
  },

  // Password Login
  loginWithPassword: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken || data.token) {
      setAuthToken(data.accessToken || data.token);
    }
    return data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// ==================== CHAT SERVICE ====================
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data) => api.post('/chat/send', data),
  sendTemplate: (data) => api.post('/whatsapp/send-template', data),
};

// ==================== CONTACTS CRM SERVICE ====================
export const contactService = {
  getContacts: (params) => api.get('/contact', { params }),
  getContactById: (id) => api.get(`/contact/${id}`),
  createContact: (data) => api.post('/contact', data),
  updateContact: (id, data) => api.put(`/contact/${id}`, data),
};

// ==================== WHATSAPP CONFIG SERVICE ====================
export const whatsappConfigService = {
  // Fetch real WhatsApp config from database
  getConfig: async () => {
    try {
      const { data } = await api.get('/settings/whatsapp_config');
      return data?.value || data || null;
    } catch (err) {
      console.warn('Error fetching whatsapp_config:', err.message);
      return null;
    }
  },

  // Save WhatsApp config to database
  saveConfig: async (configValue) => {
    const { data } = await api.post('/settings', {
      key: 'whatsapp_config',
      value: configValue,
      description: 'WhatsApp Cloud API Configuration',
    });
    return data;
  },

  // Test connection with WhatsApp API
  testConnection: async () => {
    const { data } = await api.get('/whatsapp/test-connection');
    return data;
  },
};

export default api;
