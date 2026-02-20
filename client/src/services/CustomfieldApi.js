
import axios from 'axios';

// API base URL - update based on your environment
const API_BASE_URL = 'http://localhost:5000/api/custom-fields';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - please login again');
      // Optionally redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get all custom fields
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {boolean} params.isActive - Filter by active status
 * @returns {Promise} Response with custom fields list
 */
export const getCustomFields = async (params = {}) => {
  try {
    const response = await apiClient.get('/', { params });
    return response;
  } catch (error) {
    console.error('Get custom fields error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get single custom field by ID
 * @param {string} id - Custom field ID
 * @returns {Promise} Response with custom field data
 */
export const getCustomField = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response;
  } catch (error) {
    console.error('Get custom field error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a new custom field
 * @param {Object} payload - Custom field data
 * @param {string} payload.name - Field name
 * @param {string} payload.key - Technical key
 * @param {string} payload.type - Field type (Text, Number, Date)
 * @param {string} payload.description - Field description
 * @returns {Promise} Response with created field
 */
export const createCustomField = async (payload) => {
  try {
    const response = await apiClient.post('/', payload);
    return response;
  } catch (error) {
    console.error('Create custom field error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update an existing custom field
 * @param {string} id - Custom field ID
 * @param {Object} payload - Updated field data
 * @returns {Promise} Response with updated field
 */
export const updateCustomField = async (id, payload) => {
  try {
    const response = await apiClient.put(`/${id}`, payload);
    return response;
  } catch (error) {
    console.error('Update custom field error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Toggle custom field active status
 * @param {string} id - Custom field ID
 * @returns {Promise} Response with updated field
 */
export const toggleCustomField = async (id) => {
  try {
    const response = await apiClient.patch(`/${id}/toggle`);
    return response;
  } catch (error) {
    console.error('Toggle custom field error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a custom field
 * @param {string} id - Custom field ID
 * @returns {Promise} Response confirming deletion
 */
export const deleteCustomField = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response;
  } catch (error) {
    console.error('Delete custom field error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Bulk delete custom fields
 * @param {string[]} ids - Array of custom field IDs
 * @returns {Promise} Response with deletion count
 */
export const bulkDeleteCustomFields = async (ids) => {
  try {
    const response = await apiClient.post('/bulk-delete', { ids });
    return response;
  } catch (error) {
    console.error('Bulk delete custom fields error:', error.response?.data || error.message);
    throw error;
  }
};

// Legacy alias for backward compatibility
export const listCustomFieldsApi = getCustomFields;
export const createCustomFieldApi = createCustomField;
export const updateCustomFieldApi = updateCustomField;
export const deleteCustomFieldApi = deleteCustomField;
