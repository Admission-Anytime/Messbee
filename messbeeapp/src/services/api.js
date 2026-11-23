import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Backend runs on port 5002
// Automatically detect the PC's Wi-Fi IP from the Expo connection or fallback to 192.168.1.12
const detectedHost =
  Constants?.expoConfig?.hostUri?.split(':')?.[0] ||
  Constants?.manifest2?.extra?.expoGo?.debuggerHost?.split(':')?.[0] ||
  '192.168.1.12';

export const BASE_URL =
  Platform.OS === 'android'
    ? `http://${detectedHost}:5002/api`
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
      const response = await api.get('/contacts', { params });
      const payload = response.data;
      if (payload && Array.isArray(payload.contacts)) return payload.contacts;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
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

  getMessages: async (chatId) => {
    try {
      const response = await api.get(`/chats/messages/${chatId}`);
      return response.data?.data || response.data?.messages || response.data || [];
    } catch (err) {
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

  sendTemplate: async ({ chatId, templateName, languageCode = 'en', components = [] }) => {
    const response = await api.post('/chats/send-template', {
      chatId,
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
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (payload && Array.isArray(payload.templates)) return payload.templates;
      if (Array.isArray(payload)) return payload;
      return [];
    } catch (err) {
      console.warn('templateService.getTemplates error:', err.message);
      return [];
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
};

// ==================== AUTOMATIONS / BOT SERVICE ====================
export const automationService = {
  getAutomations: async () => {
    try {
      const response = await api.get('/automations');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('automationService.getAutomations error:', err.message);
      return [];
    }
  },
  getAutomationById: async (id) => {
    const response = await api.get(`/automations/${id}`);
    return response.data?.data || response.data;
  },
  createAutomation: async (automationData) => {
    const response = await api.post('/automations', automationData);
    return response.data?.data || response.data;
  },
  updateAutomation: async (id, data) => {
    const response = await api.put(`/automations/${id}`, data);
    return response.data?.data || response.data;
  },
  deleteAutomation: async (id) => {
    const response = await api.delete(`/automations/${id}`);
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

export default api;
