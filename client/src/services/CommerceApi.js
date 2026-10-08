import axios from '../context/axios';

export const getProducts = async () => {
  const response = await axios.get('/commerce/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post('/commerce/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`/commerce/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`/commerce/products/${id}`);
  return response.data;
};

export const getPayments = async () => {
  const response = await axios.get('/commerce/payments');
  return response.data;
};

// Tenant Settings endpoints
export const getMetaSettings = async () => {
  const response = await axios.get('/tenant-settings');
  return response.data;
};

export const updateMetaSettings = async (settingsData) => {
  const response = await axios.put('/tenant-settings', settingsData);
  return response.data;
};

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get('/categories?limit=100');
  return response.data;
};


