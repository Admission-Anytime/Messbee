import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine backend IP dynamically from Metro host or fallback to standard Wi-Fi LAN
const getDevHost = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return '192.168.1.12';
};

const DEV_HOST = getDevHost();

export const BASE_URL =
  Platform.OS === 'android'
    ? `http://${DEV_HOST}:5002/api`
    : `http://localhost:5002/api`;

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

// ==================== AUTH SERVICE ====================
export const authService = {
  requestLoginOTP: async (email) => {
    const { data } = await api.post('/auth/login/request-otp', { email });
    return data;
  },
  verifyLoginOTP: async (email, otp) => {
    const { data } = await api.post('/auth/login/verify-otp', { email, otp });
    if (data.accessToken || data.token) {
      setAuthToken(data.accessToken || data.token);
    }
    return data;
  },
  resendOTP: async (email, purpose = 'login') => {
    const { data } = await api.post('/auth/resend-otp', { email, purpose });
    return data;
  },
  loginWithPassword: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken || data.token) {
      setAuthToken(data.accessToken || data.token);
    }
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// ==================== CONTACTS CRM SERVICE (Real DB / API) ====================
export const contactService = {
  getContacts: async (params = {}) => {
    try {
      // Backend routes: GET /contacts or /contact
      const response = await api.get('/contacts', { params });
      const payload = response.data;
      if (payload && Array.isArray(payload.contacts)) return payload.contacts;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      // Fallback endpoint
      try {
        const fallback = await api.get('/contact', { params });
        const p = fallback.data;
        if (p && Array.isArray(p.contacts)) return p.contacts;
        if (p && Array.isArray(p.data)) return p.data;
        if (Array.isArray(p)) return p;
      } catch (_) {}
      console.warn('contactService.getContacts error:', err.message);
      return [];
    }
  },

  getContactById: async (id) => {
    try {
      const response = await api.get(`/contacts/${id}`);
      return response.data?.data || response.data?.contact || response.data;
    } catch (err) {
      const fb = await api.get(`/contact/${id}`);
      return fb.data?.data || fb.data?.contact || fb.data;
    }
  },

  createContact: async (contactData) => {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data?.data || response.data?.contact || response.data;
    } catch (err) {
      const fb = await api.post('/contact', contactData);
      return fb.data?.data || fb.data?.contact || fb.data;
    }
  },

  updateContact: async (id, contactData) => {
    try {
      const response = await api.put(`/contacts/${id}`, contactData);
      return response.data?.data || response.data?.contact || response.data;
    } catch (err) {
      const fb = await api.put(`/contact/${id}`, contactData);
      return fb.data?.data || fb.data?.contact || fb.data;
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (err) {
      const fb = await api.delete(`/contact/${id}`);
      return fb.data;
    }
  },

  importContacts: async (formData) => {
    const response = await api.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ==================== LABELS SERVICE (Real DB / API) ====================
export const labelService = {
  getLabels: async () => {
    try {
      const response = await api.get('/labels');
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.labels)) return payload.labels;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('labelService.getLabels error:', err.message);
      return [];
    }
  },

  createLabel: async (labelData) => {
    const response = await api.post('/labels', labelData);
    return response.data?.data || response.data;
  },

  updateLabel: async (id, labelData) => {
    const response = await api.put(`/labels/${id}`, labelData);
    return response.data?.data || response.data;
  },

  deleteLabel: async (id) => {
    const response = await api.delete(`/labels/${id}`);
    return response.data;
  },
};

// ==================== CRM PIPELINE SERVICE (Real DB / API) ====================
export const pipelineService = {
  getLeads: async (stage = null) => {
    try {
      const params = stage ? { stage } : {};
      const contacts = await contactService.getContacts(params);
      return contacts;
    } catch (err) {
      console.warn('pipelineService.getLeads error:', err.message);
      return [];
    }
  },

  updateLeadStage: async (id, newStage) => {
    try {
      return await contactService.updateContact(id, { stage: newStage });
    } catch (err) {
      console.warn('pipelineService.updateLeadStage error:', err.message);
      throw err;
    }
  },
};

// ==================== CHAT SERVICE ====================
export const chatService = {
  getChats: async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chats?page=${page}&limit=${limit}`);
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return [];
    }
  },
  getMessages: async (chatId) => {
    try {
      const response = await api.get(`/chats/messages/${chatId}`);
      return response.data?.data || response.data?.messages || response.data || [];
    } catch (err) {
      return [];
    }
  },
  sendMessage: (data) => api.post('/chats/message', data),
  sendTemplate: (data) => api.post('/chats/send-template', data),
};

export default api;
