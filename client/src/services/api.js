import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tilematch_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tilematch_token');
      localStorage.removeItem('tilematch_user');
      window.location.href = '/account';
    }
    return Promise.reject(error);
  }
);

// === AUTH ===
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// === PRODUCTS ===
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFilterOptions: () => api.get('/products/filters/options')
};

// === CART ===
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`)
};

// === ORDERS ===
export const ordersAPI = {
  place: (data) => api.post('/orders/place', data),
  history: () => api.get('/orders/history'),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`)
};

// === ADMIN ===
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  // Products
  getProducts: (search) => api.get('/admin/products', { params: { search } }),
  addProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  // Inventory
  getInventory: (filter) => api.get('/admin/inventory', { params: { filter } }),
  updateStock: (productId, stockQty) => api.put(`/admin/inventory/${productId}`, { stockQty }),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  // Analytics
  monthlyRevenue: () => api.get('/admin/analytics/monthly'),
  categoryRevenue: () => api.get('/admin/analytics/categories'),
  bestsellers: () => api.get('/admin/analytics/bestsellers'),
  exportCSV: () => api.get('/admin/analytics/export-csv', { responseType: 'blob' })
};

export default api;
