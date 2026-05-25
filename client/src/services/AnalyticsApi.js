import axios from '../context/axios';

const AnalyticsApi = {
  /**
   * Get template analytics
   * @param {string} startDate  - ISO date string (YYYY-MM-DD)
   * @param {string} endDate    - ISO date string (YYYY-MM-DD)
   * @param {string} groupBy    - 'daily' | 'weekly' | 'monthly'
   */
  getTemplateAnalytics: async ({ startDate, endDate, groupBy = 'daily' } = {}) => {
    const params = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get('/analytics/templates', { params });
    return response.data;
  },

  getDashboardAnalytics: async ({ startDate, endDate } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get('/analytics/dashboard', { params });
    return response.data;
  },

  getMessageAnalytics: async ({ startDate, endDate, groupBy = 'daily' } = {}) => {
    const params = { groupBy };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axios.get('/analytics/messages', { params });
    return response.data;
  },

  getCampaignAnalytics: async () => {
    const response = await axios.get('/analytics/campaigns');
    return response.data;
  },
};

export default AnalyticsApi;
