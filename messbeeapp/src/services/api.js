import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator use 10.0.2.2, for physical device use your computer's local Wi-Fi IP
export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let userToken = null;

export const setAuthToken = (token) => {
  userToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const authService = {
  login: (data) => api.post('/auth/login', data),
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  getProfile: () => api.get('/user/profile'),
};

// Chats Endpoints
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data) => api.post('/chat/send', data),
  sendTemplate: (data) => api.post('/whatsapp/send-template', data),
};

// Contacts CRM Endpoints
export const contactService = {
  getContacts: (params) => api.get('/contact', { params }),
  getContactById: (id) => api.get(`/contact/${id}`),
  createContact: (data) => api.post('/contact', data),
  updateContact: (id, data) => api.put(`/contact/${id}`, data),
};

export default api;

