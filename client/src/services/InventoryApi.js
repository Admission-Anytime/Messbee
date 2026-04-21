import axios from '../context/axios';

const InventoryApi = {
  getInventoryItems: async (params = {}) => {
    const response = await axios.get('/inventory', { params });
    return Array.isArray(response.data) ? response.data : [];
  },

  getInventorySummary: async () => {
    const response = await axios.get('/inventory/summary');
    return response.data;
  },

  verifyMetaConnection: async () => {
    const response = await axios.get('/inventory/meta-verification');
    return response.data;
  },

  initializeCommerceSettings: async (payload = {}) => {
    const response = await axios.post('/inventory/meta-verification/init-commerce', payload);
    return response.data;
  },

  createInventoryItem: async (payload) => {
    const response = await axios.post('/inventory', payload);
    return response.data;
  },

  updateInventoryItem: async (id, payload) => {
    const response = await axios.put(`/inventory/${id}`, payload);
    return response.data;
  },

  deleteInventoryItem: async (id) => {
    const response = await axios.delete(`/inventory/${id}`);
    return response.data;
  },
};

export default InventoryApi;
