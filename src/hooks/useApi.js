import { useState } from 'react';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const auth = {
    login: (credentials) => callApi(apiService.login, credentials),
    register: (userData) => callApi(apiService.register, userData),
    getProfile: () => callApi(apiService.getProfile),
    updateProfile: (userData) => callApi(apiService.updateProfile, userData),
    deleteProfile: () => callApi(apiService.deleteProfile)
  };

  const products = {
    getAll: (params) => callApi(apiService.getProducts, params),
    getById: (id) => callApi(apiService.getProduct, id),
    getCategories: () => callApi(apiService.getCategories)
  };

  const cart = {
    get: () => callApi(apiService.getCart),
    add: (productId, quantity) => callApi(apiService.addToCart, productId, quantity),
    update: (itemId, quantity) => callApi(apiService.updateCartItem, itemId, quantity),
    remove: (itemId) => callApi(apiService.removeFromCart, itemId)
  };

  const orders = {
    getAll: () => callApi(apiService.getOrders),
    getById: (id) => callApi(apiService.getOrder, id)
  };

  const payment = {
    createIntent: () => callApi(apiService.createPaymentIntent),
    confirm: (paymentData) => callApi(apiService.confirmPayment, paymentData)
  };

  return {
    loading,
    error,
    auth,
    products,
    cart,
    orders,
    payment,
    healthCheck: () => callApi(apiService.healthCheck)
  };
};