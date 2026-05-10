import axios from '../context/axios';

/**
 * Get all automations
 * @returns {Promise} - Array of automations
 */
export const getAllAutomations = async () => {
  try {
    const response = await axios.get('/automation');
    // Ensure we always return an array from the data property
    const data = response.data.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching automations:', error);
    throw error;
  }
};

/**
 * Create a new automation
 * @param {Object} automationData - Automation data
 * @returns {Promise} - Created automation
 */
export const createAutomation = async (automationData) => {
  try {
    const response = await axios.post('/automation', automationData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating automation:', error);
    throw error;
  }
};

/**
 * Update an automation
 * @param {string} id - Automation ID
 * @param {Object} automationData - Updated automation data
 * @returns {Promise} - Updated automation
 */
export const updateAutomation = async (id, automationData) => {
  try {
    const response = await axios.put(`/automation/${id}`, automationData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating automation:', error);
    throw error;
  }
};

/**
 * Toggle automation status
 * @param {string} id - Automation ID
 * @returns {Promise} - Updated automation
 */
export const toggleAutomation = async (id) => {
  try {
    const response = await axios.put(`/automation/${id}/toggle`);
    return response.data.data;
  } catch (error) {
    console.error('Error toggling automation:', error);
    throw error;
  }
};

/**
 * Delete an automation
 * @param {string} id - Automation ID
 * @returns {Promise} - Deletion response
 */
export const deleteAutomation = async (id) => {
  try {
    const response = await axios.delete(`/automation/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting automation:', error);
    throw error;
  }
};

export default {
  getAllAutomations,
  createAutomation,
  updateAutomation,
  toggleAutomation,
  deleteAutomation,
};
