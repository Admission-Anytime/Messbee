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

  updateCampaignStats: async (id, stats) => {
    const response = await axios.put(`/campaigns/${id}/stats`, stats);
    return response.data;
  }
};

export default CampaignApi;
