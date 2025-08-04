import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAppContext } from '../store';

const Orders = () => {
  const { store } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
          <p className="text-gray-600 mt-2">
            Revisa el estado de tus compras y órdenes recientes
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-500 mb-6">
                Cuando realices una compra, aparecerá aquí
              </p>
              <Link
                to="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orden #{order.id}
                      </h3>
                      <p className="text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        ${order.total_amount}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Dirección de Envío</h4>
                        <p className="text-gray-600 text-sm">
                          {order.shipping_address}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">ID de Pago</h4>
                        <p className="text-gray-600 text-sm font-mono">
                          {order.stripe_payment_intent_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Productos</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center">
                                {item.product?.image_url && (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded mr-3"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.product?.name || 'Producto eliminado'}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    Cantidad: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  ${item.subtotal}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  ${item.price} c/u
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver detalles →
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                        Volver a comprar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;