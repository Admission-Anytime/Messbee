import axios from '../context/axios';

const CampaignApi = {
  getCampaigns: async () => {
    const response = await axios.get('/campaigns');
    return response.data;
  },

  getCampaignById: async (id) => {
    const response = await axios.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (campaignData) => {
    const response = await axios.post('/campaigns', campaignData);
    return response.data;
  },

  updateCampaign: async (id, campaignData) => {
    const response = await axios.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (id) => {
    const response = await axios.delete(`/campaigns/${id}`);
    return response.data;
  },

  sendCampaign: async (id) => {
    const response = await axios.post(`/campaigns/${id}/send`);
    return response.data;
  },

  pauseCampaign: async (id) => {
    const response = await axios.post(`/campaigns/${id}/pause`);
    return response.data;
  },

  resumeCampaign: async (id) => {
    const response = await axios.post(`/campaigns/${id}/resume`);
    return response.data;
  },

  cancelCampaign: async (id) => {
    const response = await axios.post(`/campaigns/${id}/cancel`);
    return response.data;
  },

  getCampaignQueue: async (id) => {
    const response = await axios.get(`/campaigns/${id}/queue`);
    return response.data;
  },

  updateCampaignStats: async (id, stats) => {
    const response = await axios.put(`/campaigns/${id}/stats`, stats);
    return response.data;
  }
};

export default CampaignApi;
