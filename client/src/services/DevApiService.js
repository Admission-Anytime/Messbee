import axios from '../context/axios';

/**
 * Get all API keys
 */
export const getApiKeys = async () => {
  try {
    const response = await axios.get('/dev/keys');
    return response;
  } catch (error) {
    console.error('Get API keys error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a new API key
 */
export const createApiKey = async (payload) => {
  try {
    const response = await axios.post('/dev/keys', payload);
    return response;
  } catch (error) {
    console.error('Create API key error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete an API key
 */
export const deleteApiKey = async (id) => {
  try {
    const response = await axios.delete(`/dev/keys/${id}`);
    return response;
  } catch (error) {
    console.error('Delete API key error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get Webhook config
 */
export const getWebhookConfig = async () => {
  try {
    const response = await axios.get('/dev/webhook');
    return response;
  } catch (error) {
    console.error('Get webhook config error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save Webhook config
 */
export const saveWebhookConfig = async (payload) => {
  try {
    const response = await axios.post('/dev/webhook', payload);
    return response;
  } catch (error) {
    console.error('Save webhook config error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Toggle Webhook Event
 */
export const toggleWebhookEvent = async (eventId) => {
  try {
    const response = await axios.patch(`/dev/webhook/events/${eventId}`);
    return response;
  } catch (error) {
    console.error('Toggle webhook event error:', error.response?.data || error.message);
    throw error;
  }
};
