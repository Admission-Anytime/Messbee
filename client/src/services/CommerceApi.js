import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/commerce`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await axiosInstance.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

export const getPayments = async () => {
  const response = await axiosInstance.get('/payments');
  return response.data;
};

// Tenant Settings endpoints
export const getMetaSettings = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/tenant-settings`, { withCredentials: true });
  return response.data;
};

export const updateMetaSettings = async (settingsData) => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/tenant-settings`, settingsData, { withCredentials: true });
  return response.data;
};
