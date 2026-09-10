import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle errors
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    // Handle specific error responses
    if (error.response.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - please log in again.');
    } else if (error.response.status === 403) {
      // Handle forbidden access
      console.error('Forbidden access - you do not have permission.');
    } else {
      console.error('An error occurred:', error.response.data.message);
    }
  } else {
    console.error('Network error:', error.message);
  }
  return Promise.reject(error);
});

export default api;