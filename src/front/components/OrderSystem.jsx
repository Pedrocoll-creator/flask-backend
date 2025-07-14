import React, { useState, useEffect } from 'react';

const OrderSystem = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = 'https://effective-train-x5v9g99w6xpvh979g-3001.app.github.dev/api';

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('❌ No estás autenticado. Inicia sesión primero.');
      return null;
    }
    return token;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    } : null;
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadCart = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_BASE}/cart`, { headers });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  };

  const loadOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`${API_BASE}/orders`, { headers });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId, quantity })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Producto agregado al carrito');
        loadCart();
      } else {
        setMessage(`❌ ${data.message || 'Error al agregar al carrito'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (cart.items.length === 0) {
      setMessage('❌ El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        street: 'Calle Ejemplo 123',
        city: 'Madrid',
        postal_code: '28001',
        country: 'España'
      };

      const response = await fetch(`${API_BASE}/confirm-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payment_intent_id: 'pi_fake_' + Date.now(),
          shipping_address: shippingAddress
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ ¡Pedido creado exitosamente!');
        loadCart();
        loadOrders();
        setActiveTab('orders');
      } else {
        setMessage(`❌ ${data.message || 'Error al crear pedido'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    if (getAuthToken()) {
      loadCart();
      loadOrders();
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛍️ Sistema de Pedidos</h1>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
          <button 
            onClick={() => setMessage('')}
            className="ml-2 text-sm underline"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'products' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📦 Productos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'cart' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🛒 Carrito ({cart.count})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'orders' 
              ? 'bg-white text-blue-600 shadow' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Mis Pedidos ({orders.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>
          {products.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={loading || product.stock === 0}
                    className={`w-full mt-3 py-2 px-4 rounded-md text-white font-medium ${
                      product.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : loading
                        ? 'bg-blue-400 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {product.stock === 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cart' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mi Carrito</h2>
          {cart.items.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div>
              <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
                    <div>
                      <h3 className="font-semibold">{item.product?.name}</h3>
                      <p className="text-gray-600">Cantidad: {item.quantity}</p>
                      <p className="text-green-600 font-bold">${item.product?.price} c/u</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${(item.product?.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-green-600">${cart.total.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={createOrder}
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-md text-white font-bold text-lg ${
                    loading 
                      ? 'bg-gray-400 cursor-wait' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? '⏳ Procesando...' : '✨ Crear Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mis Pedidos</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tienes pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Pedido #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'processing' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'processing' ? 'Procesando' : 
                       order.status === 'completed' ? 'Completado' : order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product?.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${order.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderSystem;