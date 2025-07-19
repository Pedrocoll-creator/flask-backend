import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Eye,
  RefreshCw,
  AlertCircle,
  Truck,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const MyOrders = () => {
  const { state } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Error al cargar los pedidos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-secondary-600">Cargando pedidos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">Mis Pedidos</h1>
                <p className="text-secondary-600 mt-1">Consulta el estado de tus compras</p>
              </div>
            </div>
            
            <button
              onClick={loadOrders}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
            <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">No tienes pedidos aún</h2>
            <p className="text-secondary-600 mb-6">¡Empieza a comprar y tus pedidos aparecerán aquí!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                
                {/* Header del pedido */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          Pedido #{order.id}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-secondary-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </span>
                      
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{selectedOrder === order.id ? 'Ocultar' : 'Ver'} detalles</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumen del pedido */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Total */}
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary-600">Total</div>
                        <div className="text-lg font-semibold text-secondary-900">
                          €{parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary-600">Productos</div>
                        <div className="text-lg font-semibold text-secondary-900">
                          {order.order_items?.length || 0} items
                        </div>
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-secondary-600">Envío</div>
                        <div className="text-sm font-medium text-secondary-900 truncate">
                          {order.shipping_address ? 
                            (typeof order.shipping_address === 'string' ? 
                              order.shipping_address : 
                              `${order.shipping_first_name} ${order.shipping_last_name}`
                            ) : 
                            'No especificado'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {selectedOrder === order.id && (
                  <div className="border-t border-secondary-200 p-6 bg-secondary-50">
                    <h4 className="text-lg font-semibold text-secondary-900 mb-4">Productos del pedido</h4>
                    
                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="space-y-4">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {item.product?.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product_name || item.product?.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h5 className="font-medium text-secondary-900">
                                  {item.product_name || item.product?.name || 'Producto'}
                                </h5>
                                <p className="text-sm text-secondary-600">
                                  Cantidad: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-secondary-900">
                                €{parseFloat(item.subtotal || item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-secondary-600">
                                €{parseFloat(item.price).toFixed(2)} c/u
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
                        <p className="text-secondary-600">No hay detalles de productos disponibles</p>
                      </div>
                    )}

                    {/* Información de envío */}
                    {order.shipping_address && (
                      <div className="mt-6 pt-6 border-t border-secondary-200">
                        <h5 className="font-medium text-secondary-900 mb-2">Dirección de envío</h5>
                        <div className="text-sm text-secondary-600">
                          {typeof order.shipping_address === 'string' ? (
                            <p>{order.shipping_address}</p>
                          ) : (
                            <div>
                              <p>{order.shipping_first_name} {order.shipping_last_name}</p>
                              <p>{order.shipping_address}</p>
                              <p>{order.shipping_city}, {order.shipping_postal_code}</p>
                              <p>{order.shipping_country}</p>
                              {order.shipping_phone && <p>Tel: {order.shipping_phone}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;