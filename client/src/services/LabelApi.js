import axios from 'axios';

// API base URL - update based on your environment
const API_BASE_URL = 'http://localhost:5000/api/labels';

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
    }
    return Promise.reject(error);
  }
);

/**
 * Get all labels
 * @returns {Promise} - Array of labels
 */
export const getAllLabels = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching labels:', error);
    throw error;
  }
};

/**
 * Create a new label
 * @param {Object} labelData - Label data
 * @returns {Promise} - Created label
 */
export const createLabel = async (labelData) => {
  try {
    const response = await apiClient.post('/', labelData);
    return response.data;
  } catch (error) {
    console.error('Error creating label:', error);
    throw error;
  }
};

/**
 * Update a label
 * @param {string} id - Label ID
 * @param {Object} labelData - Updated label data
 * @returns {Promise} - Updated label
 */
export const updateLabel = async (id, labelData) => {
  try {
    const response = await apiClient.put(`/${id}`, labelData);
    return response.data;
  } catch (error) {
    console.error('Error updating label:', error);
    throw error;
  }
};

/**
 * Delete a label
 * @param {string} id - Label ID
 * @returns {Promise} - Deletion response
 */
export const deleteLabel = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting label:', error);
    throw error;
  }
};

/**
 * Initialize system labels
 * @returns {Promise} - Initialization response
 */
export const initializeSystemLabels = async () => {
  try {
    const response = await apiClient.post('/initialize/system');
    return response.data;
  } catch (error) {
    console.error('Error initializing system labels:', error);
    throw error;
  }
};

export default {
  getAllLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  initializeSystemLabels,
};
