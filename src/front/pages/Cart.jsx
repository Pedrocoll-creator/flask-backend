import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { cartAPI, handleAPIError, formatPrice } from '../utils/api';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ShoppingBag,
  Heart,
  Tag,
  Truck,
  Shield,
  AlertCircle,
  Gift
} from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  
  // Estados locales
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    if (getters.isAuthenticated) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [getters.isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      actions.setCart(response.data.items);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      
      await cartAPI.updateCartItem(itemId, newQuantity);
      
      actions.updateCartItem({
        id: itemId,
        quantity: newQuantity,
        // Mantener otros datos del item
        ...state.cart.find(item => item.id === itemId)
      });
      
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      actions.removeFromCart(itemId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error(handleAPIError(error));
    }
  };

  const applyPromoCode = () => {
    // Simulación de códigos promocionales
    const validCodes = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FIRST50': 50
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setPromoApplied(true);
      setPromoDiscount(validCodes[promoCode.toUpperCase()]);
      toast.success(`¡Código aplicado! ${validCodes[promoCode.toUpperCase()]}% de descuento`);
    } else {
      toast.error('Código promocional no válido');
    }
  };

  const removePromoCode = () => {
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
    toast.info('Código promocional eliminado');
  };

  // Cálculos
  const subtotal = getters.cartTotal;
  const discount = promoApplied ? (subtotal * promoDiscount) / 100 : 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const taxes = (subtotal - discount + shipping) * 0.16; // 16% IVA
  const total = subtotal - discount + shipping + taxes;

  const handleCheckout = () => {
    if (!getters.isAuthenticated) {
      toast.info('Inicia sesión para continuar con la compra');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (state.cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    navigate('/checkout');
  };

  // Renderizado condicional para usuarios no autenticados
  if (!getters.isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-secondary-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Inicia sesión para ver tu carrito
            </h1>
            <p className="text-secondary-600 mb-8">
              Necesitas una cuenta para guardar productos en tu carrito
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link to="/login" className="btn-primary inline-block">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-secondary inline-block">
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex space-x-4">
                      <div className="bg-secondary-200 rounded-lg w-24 h-24"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                        <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                        <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6 h-fit">
                <div className="space-y-4">
                  <div className="h-6 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-10 bg-secondary-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-secondary-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-secondary-400" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              Parece que no has agregado nada a tu carrito. 
              ¡Explora nuestros productos y encuentra algo que te guste!
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link to="/products" className="btn-primary inline-block">
                Explorar Productos
              </Link>
              <Link to="/" className="btn-secondary inline-block">
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Carrito de Compras
              </h1>
              <p className="text-secondary-600">
                {getters.cartCount} {getters.cartCount === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop'}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-lg object-cover hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="text-lg font-semibold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    
                    <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-secondary-500 capitalize">
                        {item.product.category}
                      </span>
                      {item.product.stock <= 5 && (
                        <span className="text-sm text-red-600 font-medium">
                          ¡Solo quedan {item.product.stock}!
                        </span>
                      )}
                    </div>

                    
                    <div className="mt-4 sm:hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">
                          {formatPrice(item.product.price)}
                        </span>
                        <span className="text-sm text-secondary-600">
                          Subtotal: {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        
                        <div className="flex items-center border border-secondary-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="p-2 hover:bg-secondary-50 transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-2 min-w-[3rem] text-center font-medium">
                            {updatingItems.has(item.id) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || updatingItems.has(item.id)}
                            className="p-2 hover:bg-secondary-50 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {/* Add to wishlist logic */}}
                            className="p-2 text-secondary-400 hover:text-red-500 transition-colors"
                            title="Agregar a favoritos"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-secondary-400 hover:text-red-600 transition-colors"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <div className="hidden sm:flex flex-col items-end space-y-4 min-w-[200px]">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        {formatPrice(item.product.price)}
                      </div>
                      <div className="text-sm text-secondary-600">
                        Subtotal: {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>

                    
                    <div className="flex items-center border border-secondary-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                        className="p-2 hover:bg-secondary-50 transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 min-w-[3rem] text-center font-medium">
                        {updatingItems.has(item.id) ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock || updatingItems.has(item.id)}
                        className="p-2 hover:bg-secondary-50 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* Add to wishlist logic */}}
                        className="p-2 text-secondary-400 hover:text-red-500 transition-colors"
                        title="Agregar a favoritos"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-secondary-400 hover:text-red-600 transition-colors"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-secondary-900">¿Necesitas algo más?</h3>
                  <p className="text-sm text-secondary-600">Explora nuestros productos</p>
                </div>
                <Link to="/products" className="btn-secondary">
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-600" />
                Código Promocional
              </h3>
              
              {!promoApplied ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="input-field"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim()}
                    className="w-full btn-secondary disabled:opacity-50"
                  >
                    Aplicar Código
                  </button>
                  <div className="text-xs text-secondary-500">
                    Códigos de prueba: WELCOME10, SAVE20, FIRST50
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{promoCode}</p>
                      <p className="text-sm text-green-600">{promoDiscount}% de descuento aplicado</p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

           
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">
                Resumen del Pedido
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-secondary-700">
                  <span>Subtotal ({getters.cartCount} productos)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({promoDiscount}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-secondary-700">
                  <span>Envío</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-secondary-700">
                  <span>Impuestos (IVA 16%)</span>
                  <span>{formatPrice(taxes)}</span>
                </div>
                
                <hr className="border-secondary-200" />
                
                <div className="flex justify-between text-lg font-bold text-secondary-900">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

             
              {shipping === 0 ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Truck className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">¡Envío gratis incluido!</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Agrega {formatPrice(50 - subtotal)} más para envío gratis
                    </span>
                  </div>
                </div>
              )}

              
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Proceder al Pago
              </button>

             
              <div className="mt-4 flex items-center justify-center text-sm text-secondary-600">
                <Shield className="w-4 h-4 mr-2" />
                Compra 100% segura y protegida
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-secondary-900">¿Es un regalo?</h4>
                  <p className="text-sm text-secondary-600">Agregar mensaje personalizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;