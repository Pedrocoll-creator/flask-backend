import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://tu-app.onrender.com/api'
  : '/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(userData) {
    const response = await this.api.post('/register', userData);
    return response.data;
  }

  async login(credentials) {
    const response = await this.api.post('/login', credentials);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/profile');
    return response.data;
  }

  async updateProfile(userData) {
    const response = await this.api.put('/profile', userData);
    return response.data;
  }

  async deleteProfile() {
    const response = await this.api.delete('/profile');
    return response.data;
  }

  async getProducts(params = {}) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(productId) {
    const response = await this.api.get(`/products/${productId}`);
    return response.data;
  }

  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data;
  }

  async getCart() {
    const response = await this.api.get('/cart');
    return response.data;
  }

  async addToCart(productId, quantity = 1) {
    const response = await this.api.post('/cart', {
      product_id: productId,
      quantity: quantity
    });
    return response.data;
  }

  async updateCartItem(itemId, quantity) {
    const response = await this.api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId) {
    const response = await this.api.delete(`/cart/${itemId}`);
    return response.data;
  }

  async createPaymentIntent() {
    const response = await this.api.post('/create-payment-intent');
    return response.data;
  }

  async confirmPayment(paymentData) {
    const response = await this.api.post('/confirm-payment', paymentData);
    return response.data;
  }

  async getOrders() {
    const response = await this.api.get('/orders');
    return response.data;
  }

  async getOrder(orderId) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new ApiService();