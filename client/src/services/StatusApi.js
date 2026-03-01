import axios from '../context/axios';

// Use centralized axios instance with cookie-based authentication

/**
 * Get all statuses
 * @returns {Promise} - Array of statuses
 */
export const getAllStatuses = async () => {
  try {
    const response = await axios.get('/statuses/');
    // Ensure we always return an array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw error;
  }
};

/**
 * Get a single status by ID
 * @param {string} id - Status ID
 * @returns {Promise} - Status object
 */
export const getStatusById = async (id) => {
  try {
    const response = await axios.get(`/statuses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
};

/**
 * Create a new status
 * @param {Object} statusData - Status data
 * @returns {Promise} - Created status
 */
export const createStatus = async (statusData) => {
  try {
    const response = await axios.post('/statuses/', statusData);
    return response.data;
  } catch (error) {
    console.error('Error creating status:', error);
    throw error;
  }
};

/**
 * Update a status
 * @param {string} id - Status ID
 * @param {Object} statusData - Updated status data
 * @returns {Promise} - Updated status
 */
export const updateStatus = async (id, statusData) => {
  try {
    const response = await axios.put(`/statuses/${id}`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

/**
 * Delete a status
 * @param {string} id - Status ID
 * @returns {Promise} - Deletion response
 */
export const deleteStatus = async (id) => {
  try {
    const response = await axios.delete(`/statuses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting status:', error);
    throw error;
  }
};

export default {
  getAllStatuses,
  getStatusById,
  createStatus,
  updateStatus,
  deleteStatus,
};
