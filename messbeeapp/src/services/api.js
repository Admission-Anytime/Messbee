import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'messbee_auth_token';
const REFRESH_TOKEN_KEY = 'messbee_refresh_token';
const SERVER_ENV_KEY = 'messbee_server_env';

// Backend runs on port 5002 locally, or https://webservices.messbee.com/api in production
const detectedHost =
  Constants?.expoConfig?.hostUri?.split(':')?.[0] ||
  Constants?.manifest2?.extra?.expoGo?.debuggerHost?.split(':')?.[0] ||
  '192.168.1.12';

export const LIVE_BASE_URL = 'https://webservices.messbee.com/api';
export const LOCAL_BASE_URL =
  Platform.OS === 'android'
    ? `http://${detectedHost}:5002/api`
    : 'http://localhost:5002/api';

// Default to Live Production Server so production web accounts (like aips.aayush1@gmail.com) work out of the box
export let BASE_URL = LIVE_BASE_URL;
let currentEnv = 'live';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const setServerEnvironment = async (env) => {
  const nextEnv = env === 'local' ? 'local' : 'live';
  currentEnv = nextEnv;
  BASE_URL = nextEnv === 'local' ? LOCAL_BASE_URL : LIVE_BASE_URL;
  api.defaults.baseURL = BASE_URL;
  try {
    await AsyncStorage.setItem(SERVER_ENV_KEY, nextEnv);
  } catch (e) {}
  return nextEnv;
};

export const getServerEnvironment = () => currentEnv;

let userToken = null;
let userRefreshToken = null;

export const setAuthToken = async (token, refreshToken = undefined) => {
  userToken = token || null;
  if (refreshToken !== undefined) {
    userRefreshToken = refreshToken || null;
  }
  try {
    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
    if (refreshToken !== undefined) {
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  } catch (e) {
    console.warn('AsyncStorage setAuthToken error:', e.message);
  }
};

export const loadAuthToken = async () => {
  try {
    const savedEnv = await AsyncStorage.getItem(SERVER_ENV_KEY);
    if (savedEnv === 'local' || savedEnv === 'live') {
      currentEnv = savedEnv;
      BASE_URL = savedEnv === 'local' ? LOCAL_BASE_URL : LIVE_BASE_URL;
      api.defaults.baseURL = BASE_URL;
    }
  } catch (e) {}
  if (userToken) return userToken;
  try {
    const [stored, storedRefresh] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    ]);
    if (stored) userToken = stored;
    if (storedRefresh) userRefreshToken = storedRefresh;
    return stored || null;
  } catch (e) {
    console.warn('AsyncStorage loadAuthToken error:', e.message);
    return null;
  }
};

export const getAuthToken = () => userToken;

const extractToken = (data) =>
  data?.accessToken ||
  data?.token ||
  data?.tokens?.accessToken ||
  data?.data?.accessToken ||
  data?.data?.tokens?.accessToken ||
  null;

const extractRefreshToken = (data) =>
  data?.refreshToken ||
  data?.tokens?.refreshToken ||
  data?.data?.refreshToken ||
  data?.data?.tokens?.refreshToken ||
  null;

api.interceptors.request.use(
  async (config) => {
    if (!userToken) {
      await loadAuthToken();
    }
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh on 401 if refresh token is available
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        if (!userRefreshToken) {
          userRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        }
        if (userRefreshToken) {
          const refreshRes = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken: userRefreshToken,
          });
          const newAccess = extractToken(refreshRes.data);
          const newRefresh = extractRefreshToken(refreshRes.data);
          if (newAccess) {
            await setAuthToken(newAccess, newRefresh || userRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        await setAuthToken(null, null);
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  requestSignupOTP: async (name, email, password, phone, additionalData = {}) => {
    const { data } = await api.post('/auth/signup/request-otp', {
      name,
      email,
      password,
      phone,
      ...additionalData,
    });
    return data;
  },
  verifySignupOTP: async (email, otp) => {
    const { data } = await api.post('/auth/signup/verify-otp', { email, otp });
    const token = extractToken(data);
    const refresh = extractRefreshToken(data);
    if (token) {
      await setAuthToken(token, refresh);
    }
    return data;
  },
  requestLoginOTP: async (email) => {
    const { data } = await api.post('/auth/login/request-otp', { email });
    return data;
  },
  verifyLoginOTP: async (email, otp) => {
    const { data } = await api.post('/auth/login/verify-otp', { email, otp });
    const token = extractToken(data);
    const refresh = extractRefreshToken(data);
    if (token) {
      await setAuthToken(token, refresh);
    }
    return data;
  },
  resendOTP: async (email, purpose = 'login') => {
    const { data } = await api.post('/auth/resend-otp', { email, purpose });
    return data;
  },
  loginWithPassword: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const token = extractToken(data);
    const refresh = extractRefreshToken(data);
    if (token) {
      await setAuthToken(token, refresh);
    }
    return data;
  },
  logout: async () => {
    await setAuthToken(null, null);
  },
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data?.user || data;
  },
  getUserProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data?.data || data;
  },
  updateUserProfile: async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    return data?.data || data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
    return data;
  },
  updatePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/update-password', { currentPassword, newPassword });
    return data;
  },
};

// ==================== CONTACTS CRM SERVICE (Real DB / API) ====================
export const contactService = {
  getContacts: async (params = {}) => {
    try {
      const response = await api.get('/contacts', { params });
      const payload = response.data;
      if (payload && Array.isArray(payload.contacts)) return payload.contacts;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('contactService.getContacts error:', err.message);
      return [];
    }
  },

  getContactById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data?.data || response.data?.contact || response.data;
  },

  createContact: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data?.data || response.data?.contact || response.data;
  },

  updateContact: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data?.data || response.data?.contact || response.data;
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await api.delete('/contacts/bulk-delete', { data: { ids } });
    return response.data;
  },

  bulkUpdateStatus: async (ids, status) => {
    const response = await api.put('/contacts/bulk-status', { ids, status });
    return response.data;
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

// ==================== CHAT SERVICE (Real DB / API) ====================
export const chatService = {
  getChats: async (page = 1, limit = 100) => {
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

  getMessages: async (chatId) => {
    try {
      const response = await api.get(`/chats/messages/${chatId}`);
      return response.data?.data || response.data?.messages || response.data || [];
    } catch (err) {
      if (err?.response?.status === 404) {
        throw err;
      }
      console.warn('chatService.getMessages error:', err.message);
      return [];
    }
  },

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

  markAsRead: async (chatId) => {
    try {
      const response = await api.put(`/chats/${chatId}/read`);
      return response.data;
    } catch (err) {
      return null;
    }
  },

  sendTemplate: async ({ chatId, to, phone, templateName, languageCode = 'en', components = [] }) => {
    const recipient = to || phone;
    if (chatId) {
      try {
        const response = await api.post('/chats/send-template', {
          chatId,
          templateName,
          languageCode,
          components,
        });
        return response.data?.data || response.data;
      } catch (err) {
        if (err?.response?.status === 404 && recipient) {
          const fallbackRes = await api.post('/whatsapp/send-template', {
            to: recipient,
            templateName,
            languageCode,
            components,
          });
          return fallbackRes.data?.data || fallbackRes.data;
        }
        throw err;
      }
    }
    const response = await api.post('/whatsapp/send-template', {
      to: recipient,
      templateName,
      languageCode,
      components,
    });
    return response.data?.data || response.data;
  },

  getActivityLogs: async (chatId) => {
    try {
      const response = await api.get(`/chats/activity/${chatId}`);
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('chatService.getActivityLogs error:', err.message);
      return [];
    }
  },

  updateStatus: async (chatId, chatStatus) => {
    const response = await api.put(`/chats/${chatId}/status`, { chatStatus });
    return response.data;
  },

  updateLabels: async (chatId, labels) => {
    const response = await api.put(`/chats/${chatId}/labels`, { labels });
    return response.data;
  },

  updateProfile: async (chatId, profileData) => {
    const response = await api.put(`/chats/${chatId}/profile`, profileData);
    return response.data;
  },

  togglePin: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/pin`);
    return response.data;
  },

  toggleArchive: async (chatId) => {
    const response = await api.put(`/chats/${chatId}/archive`);
    return response.data;
  },

  clearHistory: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}/messages`);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },

  assignAgent: async (chatId, teamMember) => {
    const response = await api.put(`/chats/${chatId}/assign`, { teamMember });
    return response.data;
  },

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
      const payload = response.data;
      if (payload?.data && Array.isArray(payload.data.data)) return payload.data.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.templates)) return payload.templates;
      if (payload && Array.isArray(payload.approvedTemplates)) {
        return [...payload.approvedTemplates, ...(payload.nonApprovedTemplates || [])];
      }
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('templateService.getTemplates error:', err?.response?.data?.message || err.message);
      throw err;
    }
  },
  getTemplateById: async (templateId) => {
    const response = await api.get(`/whatsapp/templates/${templateId}`);
    return response.data?.data || response.data;
  },
  createTemplate: async (data) => {
    const response = await api.post('/whatsapp/templates', data);
    return response.data?.data || response.data;
  },
  updateTemplate: async (templateId, data) => {
    const response = await api.put(`/whatsapp/templates/${templateId}`, data);
    return response.data?.data || response.data;
  },
  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/whatsapp/templates/${templateId}`);
    return response.data;
  },
};

// ==================== CAMPAIGN SERVICE (Real DB / API) ====================
export const campaignService = {
  getCampaigns: async (params = {}) => {
    try {
      const response = await api.get('/campaigns', { params });
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.campaigns)) return payload.campaigns;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('campaignService.getCampaigns error:', err.message);
      return [];
    }
  },

  getCampaignById: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data?.data || response.data?.campaign || response.data;
  },

  createCampaign: async (campaignData) => {
    const response = await api.post('/campaigns', campaignData);
    return response.data?.data || response.data?.campaign || response.data;
  },

  updateCampaign: async (id, campaignData) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data?.data || response.data;
  },

  sendCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/send`);
    return response.data;
  },

  pauseCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/pause`);
    return response.data;
  },

  resumeCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/resume`);
    return response.data;
  },

  cancelCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/cancel`);
    return response.data;
  },

  deleteCampaign: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
};

// ==================== CUSTOM FIELDS SERVICE ====================
export const customFieldService = {
  getCustomFields: async (params = {}) => {
    try {
      const response = await api.get('/custom-fields', { params });
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('customFieldService.getCustomFields error:', err.message);
      return [];
    }
  },

  getCustomField: async (id) => {
    const response = await api.get(`/custom-fields/${id}`);
    return response.data?.data || response.data;
  },

  createCustomField: async (data) => {
    const response = await api.post('/custom-fields', data);
    return response.data?.data || response.data;
  },

  updateCustomField: async (id, data) => {
    const response = await api.put(`/custom-fields/${id}`, data);
    return response.data?.data || response.data;
  },

  toggleCustomField: async (id) => {
    const response = await api.patch(`/custom-fields/${id}/toggle`);
    return response.data?.data || response.data;
  },

  deleteCustomField: async (id) => {
    const response = await api.delete(`/custom-fields/${id}`);
    return response.data;
  },
};

// ==================== QUICK REPLIES SERVICE ====================
export const quickReplyService = {
  getQuickReplies: async () => {
    try {
      const response = await api.get('/quick-replies');
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('quickReplyService.getQuickReplies error:', err.message);
      return [];
    }
  },

  createQuickReply: async (data) => {
    const response = await api.post('/quick-replies', data);
    return response.data?.data || response.data;
  },

  updateQuickReply: async (id, data) => {
    const response = await api.put(`/quick-replies/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteQuickReply: async (id) => {
    const response = await api.delete(`/quick-replies/${id}`);
    return response.data;
  },
};

// ==================== LIFECYCLE STATUS SERVICE ====================
export const statusService = {
  getStatuses: async () => {
    try {
      const response = await api.get('/statuses');
      const payload = response.data;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('statusService.getStatuses error:', err.message);
      return [];
    }
  },

  getStatusById: async (id) => {
    const response = await api.get(`/statuses/${id}`);
    return response.data?.data || response.data;
  },

  createStatus: async (data) => {
    const response = await api.post('/statuses', data);
    return response.data?.data || response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/statuses/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteStatus: async (id) => {
    const response = await api.delete(`/statuses/${id}`);
    return response.data;
  },
};

// ==================== WHATSAPP CONFIG SERVICE (Real DB / API) ====================
export const whatsappConfigService = {
  getConfig: async () => {
    try {
      const response = await api.get('/settings/whatsapp_config');
      return response.data?.value || response.data || null;
    } catch (err) {
      console.warn('whatsappConfigService.getConfig error:', err.message);
      return null;
    }
  },
  saveConfig: async (configValue) => {
    try {
      const response = await api.post('/settings', {
        key: 'whatsapp_config',
        value: configValue,
        description: 'WhatsApp Cloud API Configuration',
      });
      return response.data?.value || response.data;
    } catch (err) {
      console.warn('whatsappConfigService.saveConfig error:', err.message);
      throw err;
    }
  },
  testConnection: async () => {
    try {
      const response = await api.get('/whatsapp/test-connection');
      return response.data;
    } catch (err) {
      console.warn('whatsappConfigService.testConnection error:', err.message);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
  getPhoneStatus: async () => {
    try {
      const res = await api.get('/whatsapp/phone-status');
      return res.data;
    } catch (err) {
      try {
        const perf = await api.get('/performance/waba-config');
        return perf.data?.data || null;
      } catch (_) {
        return null;
      }
    }
  },
  registerPin: async (pin) => {
    const { data } = await api.post('/whatsapp/register', { pin });
    return data;
  },
  disconnect: async () => {
    try {
      const current = await whatsappConfigService.getConfig();
      const updated = {
        ...(current || {}),
        connected: false,
        accessToken: '',
        phoneNumberId: '',
        businessAccountId: '',
      };
      await whatsappConfigService.saveConfig(updated);
      try {
        await api.post('/whatsapp/deregister');
      } catch (_) {}
      return { success: true };
    } catch (err) {
      console.warn('whatsappConfigService.disconnect error:', err.message);
      throw err;
    }
  },
};

// ==================== FREE QR WHATSAPP SERVICE ====================
export const qrWhatsappService = {
  getStatus: async () => {
    try {
      const response = await api.get('/qr-whatsapp/status');
      return response.data;
    } catch (err) {
      console.warn('qrWhatsappService.getStatus error:', err.message);
      return { status: 'DISCONNECTED', connected: false };
    }
  },
  generateQr: async () => {
    const { data } = await api.post('/qr-whatsapp/generate-qr');
    return data;
  },
  disconnect: async () => {
    const { data } = await api.post('/qr-whatsapp/disconnect');
    return data;
  },
  getPairingCode: async (phoneNumber) => {
    const { data } = await api.post('/qr-whatsapp/pairing-code', { phoneNumber });
    return data;
  },
  sendBroadcast: async (broadcastData) => {
    const { data } = await api.post('/qr-whatsapp/broadcast', broadcastData);
    return data;
  },
  getAutoResponder: async () => {
    try {
      const { data } = await api.get('/qr-whatsapp/auto-responder');
      return data?.data || data;
    } catch (err) {
      return { enabled: false, message: '' };
    }
  },
  updateAutoResponder: async (payload) => {
    const { data } = await api.put('/qr-whatsapp/auto-responder', payload);
    return data?.data || data;
  },
};

// ==================== AUTOMATIONS / BOT SERVICE ====================
export const automationService = {
  getAutomations: async () => {
    try {
      const response = await api.get('/automation');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('automationService.getAutomations error:', err.message);
      return [];
    }
  },
  getAutomationById: async (id) => {
    const response = await api.get(`/automation/${id}`);
    return response.data?.data || response.data;
  },
  createAutomation: async (automationData) => {
    const response = await api.post('/automation', automationData);
    return response.data?.data || response.data;
  },
  updateAutomation: async (id, data) => {
    const response = await api.put(`/automation/${id}`, data);
    return response.data?.data || response.data;
  },
  deleteAutomation: async (id) => {
    const response = await api.delete(`/automation/${id}`);
    return response.data?.data || response.data;
  },
  testAutomation: async (id, payload = {}) => {
    const response = await api.post(`/automation/${id}/test`, payload);
    return response.data?.data || response.data;
  },
};

// ==================== ANALYTICS SERVICE (Real DB / API) ====================
export const analyticsService = {
  getDashboardAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/dashboard', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('analyticsService.getDashboardAnalytics error:', err.message);
      return null;
    }
  },

  getMessageAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/messages', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('analyticsService.getMessageAnalytics error:', err.message);
      return null;
    }
  },

  getConversationAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/conversations', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('analyticsService.getConversationAnalytics error:', err.message);
      return null;
    }
  },

  getTemplateAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/templates', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('analyticsService.getTemplateAnalytics error:', err.message);
      return null;
    }
  },

  getCampaignAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/campaigns', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('analyticsService.getCampaignAnalytics error:', err.message);
      return null;
    }
  },
};

// ==================== DEVELOPER API SERVICE ====================
export const devApiService = {
  getApiKeys: async () => {
    try {
      const { data } = await api.get('/dev/keys');
      return data?.data || data?.keys || data || [];
    } catch (err) {
      console.warn('devApiService.getApiKeys error:', err.message);
      return [];
    }
  },
  createApiKey: async (payload = { name: 'Mobile App Key' }) => {
    const { data } = await api.post('/dev/keys', payload);
    return data?.data || data?.apiKey || data;
  },
  deleteApiKey: async (id) => {
    const { data } = await api.delete(`/dev/keys/${id}`);
    return data;
  },
  getWebhookConfig: async () => {
    try {
      const { data } = await api.get('/dev/webhook');
      return data?.data || data?.webhook || data;
    } catch (err) {
      console.warn('devApiService.getWebhookConfig error:', err.message);
      return null;
    }
  },
  saveWebhookConfig: async (payload) => {
    const { data } = await api.post('/dev/webhook', payload);
    return data?.data || data;
  },
};

// ==================== COMMERCE SERVICE ====================
export const commerceService = {
  getProducts: async () => {
    try {
      const { data } = await api.get('/commerce/products');
      return data?.data || data?.products || data || [];
    } catch (err) {
      console.warn('commerceService.getProducts error:', err.message);
      return [];
    }
  },
  getPayments: async () => {
    try {
      const { data } = await api.get('/commerce/payments');
      return data?.data || data?.payments || data || [];
    } catch (err) {
      console.warn('commerceService.getPayments error:', err.message);
      return [];
    }
  },
  getCategories: async () => {
    try {
      const { data } = await api.get('/commerce/categories');
      return data?.data || data?.categories || data || [];
    } catch (err) {
      console.warn('commerceService.getCategories error:', err.message);
      return [];
    }
  },
  createProduct: async (productData) => {
    const { data } = await api.post('/commerce/products', productData);
    return data?.data || data;
  },
  updateProduct: async (id, productData) => {
    const { data } = await api.put(`/commerce/products/${id}`, productData);
    return data?.data || data;
  },
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/commerce/products/${id}`);
    return data;
  },
};

// ==================== NOTIFICATION SERVICE (Real DB / API) ====================
export const notificationService = {
  getNotifications: async (page = 1, limit = 20, isRead = null) => {
    try {
      let url = `/notifications?page=${page}&limit=${limit}`;
      if (isRead !== null) {
        url += `&isRead=${isRead}`;
      }
      const { data } = await api.get(url);
      return data?.data || data?.notifications || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('notificationService.getNotifications error:', err.message);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      return data?.data?.unreadCount !== undefined ? data.data.unreadCount : (data?.unreadCount || 0);
    } catch (err) {
      console.warn('notificationService.getUnreadCount error:', err.message);
      return 0;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      return data;
    } catch (err) {
      console.warn('notificationService.markAsRead error:', err.message);
      return null;
    }
  },

  markAllAsRead: async () => {
    try {
      const { data } = await api.put('/notifications/mark-all-read');
      return data;
    } catch (err) {
      console.warn('notificationService.markAllAsRead error:', err.message);
      return null;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const { data } = await api.delete(`/notifications/${notificationId}`);
      return data;
    } catch (err) {
      console.warn('notificationService.deleteNotification error:', err.message);
      return null;
    }
  },
};

// ==================== INVENTORY SERVICE (Real DB / API) ====================
export const inventoryService = {
  getInventoryLogs: async (page = 1, limit = 20, type = null, productId = null) => {
    try {
      let url = `/inventory/logs?page=${page}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      if (productId) url += `&productId=${productId}`;
      const { data } = await api.get(url);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('inventoryService.getInventoryLogs error:', err.message);
      return [];
    }
  },

  getLowStockAlerts: async () => {
    try {
      const { data } = await api.get('/inventory/low-stock');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('inventoryService.getLowStockAlerts error:', err.message);
      return [];
    }
  },

  getOutOfStock: async () => {
    try {
      const { data } = await api.get('/inventory/out-of-stock');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('inventoryService.getOutOfStock error:', err.message);
      return [];
    }
  },

  adjustStock: async (productId, newStockLevel, notes = '') => {
    const { data } = await api.post('/inventory/adjust', {
      productId,
      newStockLevel: Number(newStockLevel),
      notes: notes.trim() || 'Manual stock adjustment from mobile',
    });
    return data;
  },
};

// ==================== BILLING SERVICE (Real DB / API) ====================
export const billingService = {
  getTransactions: async () => {
    try {
      const { data } = await api.get('/billing/transactions');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('billingService.getTransactions error:', err.message);
      return [];
    }
  },

  createTransaction: async (txnData) => {
    const { data } = await api.post('/billing/transactions', txnData);
    return data?.data || data;
  },

  createRazorpayOrder: async (orderData) => {
    const { data } = await api.post('/billing/razorpay/create-order', orderData);
    return data?.data || data;
  },
};

// ==================== SALES & INVOICES SERVICE (Real DB / API) ====================
export const salesService = {
  getSales: async (search = '', page = 1, limit = 20) => {
    try {
      let url = `/sales?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const { data } = await api.get(url);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('salesService.getSales error:', err.message);
      return [];
    }
  },

  getSale: async (id) => {
    try {
      const { data } = await api.get(`/sales/${id}`);
      return data?.data || data;
    } catch (err) {
      console.warn('salesService.getSale error:', err.message);
      return null;
    }
  },

  createSale: async (saleData) => {
    const { data } = await api.post('/sales', saleData);
    return data?.data || data;
  },
};

// ==================== CUSTOMER SERVICE (Real DB / API) ====================
export const customerService = {
  getCustomers: async (search = '', page = 1, limit = 50) => {
    try {
      let url = `/customers?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const { data } = await api.get(url);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('customerService.getCustomers error:', err.message);
      return [];
    }
  },

  createCustomer: async (customerData) => {
    const { data } = await api.post('/customers', customerData);
    return data?.data || data;
  },

  updateCustomer: async (id, customerData) => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data?.data || data;
  },

  deleteCustomer: async (id) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },

  getCustomerSales: async (id) => {
    try {
      const { data } = await api.get(`/customers/${id}/sales`);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },
};

// ==================== CONTACT GROUP SERVICE (Real DB / API) ====================
export const contactGroupService = {
  getContactGroups: async () => {
    try {
      const { data } = await api.get('/contact-groups');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('contactGroupService.getContactGroups error:', err.message);
      return [];
    }
  },

  getContactGroup: async (id, page = 1, limit = 50) => {
    try {
      const { data } = await api.get(`/contact-groups/${id}?page=${page}&limit=${limit}`);
      return data?.data || data;
    } catch (err) {
      console.warn('contactGroupService.getContactGroup error:', err.message);
      return null;
    }
  },

  createContactGroup: async (groupData) => {
    const { data } = await api.post('/contact-groups', groupData);
    return data?.data || data;
  },

  updateContactGroup: async (id, groupData) => {
    const { data } = await api.put(`/contact-groups/${id}`, groupData);
    return data?.data || data;
  },

  deleteContactGroup: async (id) => {
    const { data } = await api.delete(`/contact-groups/${id}`);
    return data;
  },

  addContactsToGroup: async (id, contactIds) => {
    const { data } = await api.post(`/contact-groups/${id}/contacts`, { contactIds });
    return data?.data || data;
  },
};

// ==================== MEDIA LIBRARY SERVICE (Real DB / API) ====================
export const mediaService = {
  getMedia: async (params = {}) => {
    try {
      const { data } = await api.get('/media', { params });
      return data?.data || data?.media || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('mediaService.getMedia error:', err.message);
      return [];
    }
  },

  deleteMedia: async (id) => {
    const { data } = await api.delete(`/media/${id}`);
    return data;
  },

  bulkDeleteMedia: async (ids) => {
    const { data } = await api.post('/media/bulk-delete', { ids });
    return data;
  },
};

// ==================== PERFORMANCE & REPORTS SERVICE (Real DB / API) ====================
export const performanceService = {
  getOverview: async (date = '') => {
    try {
      const url = date ? `/performance/overview?date=${date}` : '/performance/overview';
      const { data } = await api.get(url);
      return data?.data || data;
    } catch (err) {
      console.warn('performanceService.getOverview error:', err.message);
      return null;
    }
  },

  getWabaConfig: async () => {
    try {
      const { data } = await api.get('/performance/waba-config');
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },
};

export const reportsService = {
  getDashboardStats: async () => {
    try {
      const { data } = await api.get('/reports/dashboard');
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },

  getSalesReport: async (params = {}) => {
    try {
      const { data } = await api.get('/reports/sales', { params });
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },

  getPurchaseReport: async (params = {}) => {
    try {
      const { data } = await api.get('/reports/purchases', { params });
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },
};

// ==================== SUPPLIERS & PURCHASES SERVICE (Real DB / API) ====================
export const supplierService = {
  getSuppliers: async (search = '') => {
    try {
      const url = search ? `/suppliers?search=${encodeURIComponent(search)}` : '/suppliers';
      const { data } = await api.get(url);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },

  createSupplier: async (supplierData) => {
    const { data } = await api.post('/suppliers', supplierData);
    return data?.data || data;
  },

  updateSupplier: async (id, supplierData) => {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    return data?.data || data;
  },

  deleteSupplier: async (id) => {
    const { data } = await api.delete(`/suppliers/${id}`);
    return data;
  },
};

export const purchaseService = {
  getPurchases: async (page = 1, limit = 30) => {
    try {
      const { data } = await api.get(`/purchases?page=${page}&limit=${limit}`);
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },

  createPurchase: async (purchaseData) => {
    const { data } = await api.post('/purchases', purchaseData);
    return data?.data || data;
  },
};

// ==================== CATEGORIES SERVICE (Real DB / API) ====================
export const categoryService = {
  getCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },

  createCategory: async (catData) => {
    const { data } = await api.post('/categories', catData);
    return data?.data || data;
  },

  updateCategory: async (id, catData) => {
    const { data } = await api.put(`/categories/${id}`, catData);
    return data?.data || data;
  },

  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};

// ==================== TEAM & ACCOUNT LIMITS SERVICE (Real DB / API) ====================
export const teamService = {
  getUsers: async () => {
    try {
      const { data } = await api.get('/users');
      return data?.data || data?.users || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },

  createUser: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data?.data || data;
  },

  updateUser: async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data?.data || data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  getAccountLimits: async () => {
    try {
      const { data } = await api.get('/users/account-limits');
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },

  updateSubscription: async (planData) => {
    const { data } = await api.put('/users/subscription', planData);
    return data?.data || data;
  },

  contactSales: async (inquiryData) => {
    const { data } = await api.post('/users/contact-sales', inquiryData);
    return data?.data || data;
  },
};

// ==================== ENTITIES / BRANCHES SERVICE (Real DB / API) ====================
export const entityService = {
  getEntities: async (params = {}) => {
    try {
      const { data } = await api.get('/entities', { params });
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },

  createEntity: async (entityData) => {
    const { data } = await api.post('/entities', entityData);
    return data?.data || data;
  },

  updateEntity: async (id, entityData) => {
    const { data } = await api.put(`/entities/${id}`, entityData);
    return data?.data || data;
  },

  deleteEntity: async (id) => {
    const { data } = await api.delete(`/entities/${id}`);
    return data;
  },
};

// ==================== TENANT & WORKSPACE SETTINGS SERVICE ====================
export const tenantSettingsService = {
  getSettings: async () => {
    try {
      const { data } = await api.get('/tenant-settings');
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },

  updateSettings: async (settingsData) => {
    const { data } = await api.put('/tenant-settings', settingsData);
    return data?.data || data;
  },

  getAutomationActivity: async () => {
    try {
      const { data } = await api.get('/automation/activity');
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      return [];
    }
  },
};

export default api;
