import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  cart: [],
  products: [],
  orders: [],
  loading: false,
  error: null,
  categories: [
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'home', label: 'Hogar' },
    { value: 'books', label: 'Libros' },
    { value: 'sports', label: 'Deportes' },
    { value: 'beauty', label: 'Belleza' },
    { value: 'toys', label: 'Juguetes' },
    { value: 'other', label: 'Otros' }
  ]
};

// Tipos de acciones
export const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Auth
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  
  // Products
  SET_PRODUCTS: 'SET_PRODUCTS',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  
  // Cart
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  
  // Orders
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER'
};

// Reducer
const storeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    // Auth actions
    case ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        loading: false
      };
      
    case ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        cart: [],
        orders: []
      };
      
    case ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload };

    // Products actions
    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload };
      
    case ACTIONS.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] };
      
    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
      
    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };

    // Cart actions
    case ACTIONS.SET_CART:
      return { ...state, cart: action.payload };
      
    case ACTIONS.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
      
    case ACTIONS.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
      
    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
      
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };

    // Orders actions
    case ACTIONS.SET_ORDERS:
      return { ...state, orders: action.payload };
      
    case ACTIONS.ADD_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };

    default:
      return state;
  }
};

// Contexto
const StoreContext = createContext();

// Provider
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Auto-logout si el token expira
  useEffect(() => {
    if (state.token) {
      try {
        const tokenData = JSON.parse(atob(state.token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenData.exp < currentTime) {
          dispatch({ type: ACTIONS.LOGOUT });
        }
      } catch (error) {
        dispatch({ type: ACTIONS.LOGOUT });
      }
    }
  }, [state.token]);

  // Funciones de utilidad
  const actions = {
    // Auth
    login: (user, token) => {
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: { user, token } });
    },
    
    logout: () => {
      dispatch({ type: ACTIONS.LOGOUT });
    },
    
    updateUser: (user) => {
      dispatch({ type: ACTIONS.UPDATE_USER, payload: user });
    },

    // UI
    setLoading: (loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    },
    
    clearError: () => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    },

    // Products
    setProducts: (products) => {
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: products });
    },
    
    addProduct: (product) => {
      dispatch({ type: ACTIONS.ADD_PRODUCT, payload: product });
    },
    
    updateProduct: (product) => {
      dispatch({ type: ACTIONS.UPDATE_PRODUCT, payload: product });
    },
    
    deleteProduct: (productId) => {
      dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: productId });
    },

    // Cart
    setCart: (cart) => {
      dispatch({ type: ACTIONS.SET_CART, payload: cart });
    },
    
    addToCart: (item) => {
      dispatch({ type: ACTIONS.ADD_TO_CART, payload: item });
    },
    
    updateCartItem: (item) => {
      dispatch({ type: ACTIONS.UPDATE_CART_ITEM, payload: item });
    },
    
    removeFromCart: (itemId) => {
      dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: itemId });
    },
    
    clearCart: () => {
      dispatch({ type: ACTIONS.CLEAR_CART });
    },

    // Orders
    setOrders: (orders) => {
      dispatch({ type: ACTIONS.SET_ORDERS, payload: orders });
    },
    
    addOrder: (order) => {
      dispatch({ type: ACTIONS.ADD_ORDER, payload: order });
    }
  };

  // Getters computados
  const getters = {
    cartTotal: state.cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0),
    
    cartCount: state.cart.reduce((count, item) => count + item.quantity, 0),
    
    isAuthenticated: !!state.token && !!state.user,
    
    getProductById: (id) => state.products.find(product => product.id === parseInt(id)),
    
    getOrderById: (id) => state.orders.find(order => order.id === parseInt(id))
  };

  return (
    <StoreContext.Provider value={{ state, actions, getters }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe usarse dentro de StoreProvider');
  }
  return context;
};
