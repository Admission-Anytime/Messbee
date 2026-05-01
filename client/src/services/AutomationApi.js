import axios from '../context/axios';

const AutomationApi = {
  getAutomations: async () => {
    const response = await axios.get('/automation');
    return response.data;
  },

  getAutomationById: async (id) => {
    const response = await axios.get(`/automation/${id}`);
    return response.data;
  },

  createAutomation: async (automationData) => {
    const response = await axios.post('/automation', automationData);
    return response.data;
  },

  updateAutomation: async (id, automationData) => {
    const response = await axios.put(`/automation/${id}`, automationData);
    return response.data;
  },

  deleteAutomation: async (id) => {
    const response = await axios.delete(`/automation/${id}`);
    return response.data;
  },

  toggleAutomation: async (id) => {
    const response = await axios.put(`/automation/${id}/toggle`);
    return response.data;
  }
};

export default AutomationApi;
