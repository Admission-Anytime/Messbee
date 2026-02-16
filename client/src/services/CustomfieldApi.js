
import axios from 'axios';

// Change this based on your environment:
// - Development: 'http://localhost:5000' (or whatever port your backend runs on)
// ============================================================================
const API_BASE_URL = 'http://localhost:5000/api/custom-fields';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    // Get the authentication token from localStorage (or wherever you store it)
    // This token was saved when the user logged in
    const token = localStorage.getItem('token'); // Adjust the key based on your auth implementation
    
    // If token exists, add it to the Authorization header
    // Format: "Bearer <your-token-here>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Send the modified config to the backend
  },
  (error) => {
    // Handle request errors (e.g., network issues before request is sent)
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      // You might want to redirect to login page
      console.error('Unauthorized - please login again');
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);



export const listCustomFieldsApi = async () => {
  try {
    // Make GET request to backend
    // The protect middleware will verify the token from the interceptor
    const response = await apiClient.get('/list');
    
    // Response structure from backend:
    // {
    //   success: true,
    //   data: [
    //     { _id: '123', name: 'Order Status', type: 'Text', key: 'order_status', ... },
    //     { _id: '456', name: 'Priority', type: 'Number', key: 'priority', ... }
    //   ]
    // }
    
    return response; // Return the axios response object
    
  } catch (error) {
    // If request fails, throw error so frontend can catch it
    console.error('List custom fields error:', error.response?.data || error.message);
    throw error;
  }
};


export const createCustomFieldApi = async (payload) => {
  try {
    
    
    // Make POST request with payload in the request body
    const response = await apiClient.post('/create', payload);
    
    
    
    return response;
    
  } catch (error) {
    console.error('Create custom field error:', error.response?.data || error.message);
    throw error;
  }
};


export const updateCustomFieldApi = async (id, payload) => {
  try {
  
    
    // Make PUT request with id in URL path and payload in body
    // URL becomes: /api/custom-fields/update/123abc
    const response = await apiClient.put(`/update/${id}`, payload);
    
    return response;
    
  } catch (error) {
    console.error('Update custom field error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteCustomFieldApi = async (id) => {
  try {
    // id: MongoDB _id of the field to delete (e.g., '123abc')
    
    // Make DELETE request with id in URL path
    // URL becomes: /api/custom-fields/delete/123abc
    const response = await apiClient.delete(`/delete/${id}`);
    
    // Response structure from backend:
    // {
    //   success: true,
    //   message: 'Custom field deleted successfully'
    // }
    
    return response;
    
  } catch (error) {
    console.error('Delete custom field error:', error.response?.data || error.message);
    throw error;
  }
};

