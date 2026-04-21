import axios from '../context/axios';

const PaymentApi = {
  getPayments: async (params = {}) => {
    const response = await axios.get('/payments', { params });
    // Assuming backend returns an array of payments or an object with data property
    return Array.isArray(response.data) ? response.data : response.data?.payments || response.data || [];
  },

  getPaymentById: async (id) => {
    const response = await axios.get(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (payload) => {
    const response = await axios.post('/payments', payload);
    return response.data;
  },

  getPaymentReceipt: async (paymentId) => {
    const response = await axios.get(`/payments/${paymentId}/receipt`);
    return response.data;
  }
};

export default PaymentApi;
