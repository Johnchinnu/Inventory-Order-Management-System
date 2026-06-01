import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const productsApi = {
  getAll: () => client.get('/products'),
  getById: (id) => client.get(`/products/${id}`),
  create: (data) => client.post('/products', data),
  update: (id, data) => client.put(`/products/${id}`, data),
  delete: (id) => client.delete(`/products/${id}`),
};

export const customersApi = {
  getAll: () => client.get('/customers'),
  getById: (id) => client.get(`/customers/${id}`),
  create: (data) => client.post('/customers', data),
  delete: (id) => client.delete(`/customers/${id}`),
};

export const ordersApi = {
  getAll: () => client.get('/orders'),
  getById: (id) => client.get(`/orders/${id}`),
  create: (data) => client.post('/orders', data),
  delete: (id) => client.delete(`/orders/${id}`),
};

export const dashboardApi = {
  getStats: () => client.get('/dashboard'),
};

export default client;
