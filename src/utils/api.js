import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile'),
  updateProfile: (userData) => api.put('/profile', userData),
  deleteProfile: () => api.delete('/profile'),
  deleteAccount: () => api.delete('/auth/delete-account'),
};

export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productData) => api.post('/cart', productData),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export const paymentsAPI = {
  createPaymentIntent: () => api.post('/create-payment-intent'),
  confirmPayment: (paymentData) => api.post('/confirm-payment', paymentData),
};

export const ordersAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
};

export const handleAPIError = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Intenta de nuevo.';
  }
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    switch (status) {
      case 400: return message || 'Datos inválidos';
      case 401: return 'No autorizado';
      case 403: return 'Acceso denegado';
      case 404: return 'Recurso no encontrado';
      case 409: return message || 'Conflicto de datos';
      case 422: return message || 'Datos no procesables';
      case 500: return 'Error interno del servidor';
      default: return message || 'Error del servidor';
    }
  }
  if (error.request) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  return 'Error inesperado. Inténtalo de nuevo.';
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const validateResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
};

export default api;