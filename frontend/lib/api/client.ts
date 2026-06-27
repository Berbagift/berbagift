import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors nicely
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Customize error payload format if needed
    return Promise.reject(error.response?.data || error.message || error);
  }
);
