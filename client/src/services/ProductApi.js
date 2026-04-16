import axios from '../context/axios';

const ProductApi = {
  getProducts: async (params = {}) => {
    const response = await axios.get('/products', { params });
    return Array.isArray(response.data) ? response.data : [];
  },

  getProductById: async (id) => {
    const response = await axios.get(`/products/${id}`);
    return response.data;
  },

  verifyMetaConnection: async () => {
    const response = await axios.get('/products/meta-verification');
    return response.data;
  },

  initializeCommerceSettings: async (payload = {}) => {
    const response = await axios.post('/products/meta-verification/init-commerce', payload);
    return response.data;
  },

  createProduct: async (payload) => {
    const response = await axios.post('/products', payload);
    return response.data;
  },

  updateProduct: async (id, payload) => {
    const response = await axios.put(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axios.delete(`/products/${id}`);
    return response.data;
  },
};

export default ProductApi;
