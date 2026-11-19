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

// ==================== CHAT SERVICE (Real DB / API) ====================
export const chatService = {
  // Fetch all chats with pagination & filter
  getChats: async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chats?page=${page}&limit=${limit}`);
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      console.warn('chatService.getChats error:', err.message);
      return [];
    }
  },

  // Get messages for a chat
  getMessages: async (chatId) => {
    try {
      const response = await api.get(`/chats/messages/${chatId}`);
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('chatService.getMessages error:', err.message);
      return [];
    }
  },

  // Send text message
  sendMessage: async ({ chatId, text, sender = 'me', time }) => {
    const msgTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const response = await api.post('/chats/message', {
      chatId,
      text,
      sender,
      time: msgTime,
    });
    return response.data?.data || response.data;
  },

  // Send WhatsApp approved template
  sendTemplate: async ({ chatId, templateName, languageCode = 'en', components = [] }) => {
    const response = await api.post('/chats/send-template', {
      chatId,
      templateName,
      languageCode,
      components,
    });
    return response.data?.data || response.data;
  },

  // Get contact activity history / audit logs
  getActivityLogs: async (chatId) => {
    try {
      const response = await api.get(`/chats/activity/${chatId}`);
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('chatService.getActivityLogs error:', err.message);
      return [];
    }
  },

  // Update status (e.g. Open, Resolved, Pending)
  updateStatus: async (chatId, chatStatus) => {
    const response = await api.put(`/chats/${chatId}/status`, { chatStatus });
    return response.data;
  },

  // Update labels for chat
  updateLabels: async (chatId, labels) => {
    const response = await api.put(`/chats/${chatId}/labels`, { labels });
    return response.data;
  },

  // Update contact profile info
  updateProfile: async (chatId, profileData) => {
    const response = await api.put(`/chats/${chatId}/profile`, profileData);
    return response.data;
  },

  // Toggle pinned chat
  togglePin: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/pin`);
    return response.data;
  },

  // Toggle archive
  toggleArchive: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/archive`);
    return response.data;
  },

  // Clear messages in chat
  clearHistory: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}/messages`);
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },

  // Assign agent
  assignAgent: async (chatId, teamMember) => {
    const response = await api.put(`/chats/${chatId}/assign`, { teamMember });
    return response.data;
  },

  // Create chat / contact
  createChat: async ({ name, phone, source = 'whatsapp' }) => {
    const response = await api.post('/chats', {
      name,
      phone,
      whatsappId: phone,
      source,
    });
    return response.data?.data || response.data;
  },
};

// ==================== TEMPLATE SERVICE ====================
export const templateService = {
  getTemplates: async () => {
    try {
      const response = await api.get('/whatsapp/templates');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('templateService.getTemplates error:', err.message);
      return [];
    }
  },
};

// ==================== LABELS SERVICE ====================
export const labelService = {
  getLabels: async () => {
    try {
      const response = await api.get('/labels');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('labelService.getLabels error:', err.message);
      return [];
    }
  },
  createLabel: async (data) => {
    const response = await api.post('/labels', data);
    return response.data?.data || response.data;
  },
};

// ==================== STATUSES SERVICE ====================
export const statusService = {
  getStatuses: async () => {
    try {
      const response = await api.get('/statuses');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('statusService.getStatuses error:', err.message);
      return [];
    }
  },
};

// ==================== CONTACTS CRM SERVICE ====================
export const contactService = {
  getContacts: async (params) => {
    try {
      const response = await api.get('/contact', { params });
      return response.data?.contacts || response.data?.data || response.data || [];
    } catch (err) {
      console.warn('contactService.getContacts error:', err.message);
      return [];
    }
  },
  getContactById: async (id) => {
    const response = await api.get(`/contact/${id}`);
    return response.data?.data || response.data;
  },
  createContact: async (data) => {
    const response = await api.post('/contact', data);
    return response.data?.data || response.data;
  },
  updateContact: async (id, data) => {
    const response = await api.put(`/contact/${id}`, data);
    return response.data?.data || response.data;
  },
};

export default api;
