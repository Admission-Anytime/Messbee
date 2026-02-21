import axios from '../context/axios';

// Use centralized axios instance with cookie-based authentication

/**
 * Get all labels
 * @returns {Promise} - Array of labels
 */
export const getAllLabels = async () => {
  try {
    const response = await axios.get('/labels/');
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
    const response = await axios.post('/labels/', labelData);
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
    const response = await axios.put(`/labels/${id}`, labelData);
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
    const response = await axios.delete(`/labels/${id}`);
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
    const response = await axios.post('/labels/initialize/system');
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
