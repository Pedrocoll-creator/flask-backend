import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { productsAPI, cartAPI, handleAPIError, formatPrice } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus,
  Truck,
  Shield,
  ArrowLeft,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions, getters } = useStore();
  
  // Estados locales
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      setProduct(response.data);
    } catch (error) {
      toast.error(handleAPIError(error));
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const response = await productsAPI.getProducts({
        category: product.category,
        per_page: 8
      });
      // Filtrar el producto actual
      const filtered = response.data.products.filter(p => p.id !== product.id);
      setRelatedProducts(filtered.slice(0, 4));
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!getters.isAuthenticated) {
      toast.info('Inicia sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error('Cantidad no disponible');
      return;
    }

    try {
      actions.setLoading(true);
      await cartAPI.addToCart({ 
        product_id: product.id, 
        quantity: quantity 
      });
      
      actions.addToCart({
        id: Date.now(),
        product_id: product.id,
        product: product,
        quantity: quantity
      });
      
      toast.success(`${quantity} ${product.name} agregado al carrito`);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      actions.setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (getters.isAuthenticated) {
      navigate('/cart');
    }
  };

  const handleWishlist = () => {
    if (!getters.isAuthenticated) {
      toast.info('Inicia sesión para agregar a favoritos');
      navigate('/login');
      return;
    }

    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted 
        ? 'Eliminado de favoritos' 
        : 'Agregado a favoritos'
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
   
      navigator.clipboard.writeText(window.location.href);
      toast.success('URL copiada al portapapeles');
    }
  };

  
  const productImages = product ? [
    product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
   
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&brightness=0.9',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&brightness=1.1',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&saturation=0.8'
  ] : [];

  const getStockStatus = () => {
    if (!product) return { text: '', color: '', textColor: '' };
    
    if (product.stock === 0) {
      return { text: 'Sin stock', color: 'bg-red-100', textColor: 'text-red-600' };
    } else if (product.stock <= 5) {
      return { text: '¡Solo quedan pocas unidades!', color: 'bg-red-100', textColor: 'text-red-600' };
    } else if (product.stock <= 10) {
      return { text: 'Stock limitado', color: 'bg-yellow-100', textColor: 'text-yellow-600' };
    }
    return { text: 'En stock', color: 'bg-green-100', textColor: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-secondary-200 rounded-xl h-96"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-secondary-200 rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded"></div>
                  <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Producto no encontrado</h2>
          <Link to="/products" className="btn-primary">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
     
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            <Link to="/products" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Productos
            </Link>
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            <Link 
              to={`/products?category=${product.category}`} 
              className="text-secondary-600 hover:text-primary-600 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-secondary-400" />
            <span className="text-secondary-900 font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>

       
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          
          <div className="space-y-4">
            
            <div className="relative bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
              <img
                src={imageError ? 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop' : productImages[selectedImage]}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              
              
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              
              {product.stock <= 10 && (
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock === 0 ? 'bg-red-500 text-white' :
                    product.stock <= 5 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {product.stock === 0 ? 'Sin stock' : 
                     product.stock <= 5 ? '¡Últimas unidades!' : 'Stock limitado'}
                  </span>
                </div>
              )}
            </div>

           
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary-600' 
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

         
          <div className="space-y-6">
            
            <div>
              <Link 
                to={`/products?category=${product.category}`}
                className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors capitalize"
              >
                {product.category}
              </Link>
            </div>

            
            <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900 leading-tight">
              {product.name}
            </h1>

            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-secondary-300'}`}
                  />
                ))}
              </div>
              <span className="text-secondary-600">
                {product.rating || 4.8} ({product.reviews || Math.floor(Math.random() * 50) + 10} reseñas)
              </span>
              <button className="text-primary-600 hover:text-primary-700 transition-colors text-sm">
                Ver reseñas
              </button>
            </div>

            
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-secondary-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                    -{product.discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary-600">
                Precio incluye impuestos. Envío calculado al finalizar la compra.
              </p>
            </div>

            
            <div className={`p-3 rounded-lg ${stockStatus.color}`}>
              <p className={`font-medium ${stockStatus.textColor}`}>
                {stockStatus.text}
                {product.stock > 0 && (
                  <span className="ml-2">({product.stock} disponibles)</span>
                )}
              </p>
            </div>

            
            {product.stock > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-secondary-700">
                  Cantidad:
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-secondary-300 rounded-lg">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-3 min-w-[3rem] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-secondary-600">
                    Máximo {product.stock} unidades
                  </span>
                </div>
              </div>
            )}

            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || state.loading}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    product.stock === 0
                      ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {state.loading ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-secondary-300 text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg border border-secondary-300 text-secondary-600 hover:bg-secondary-50 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {product.stock > 0 && (
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-secondary-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-secondary-800 transition-colors flex items-center justify-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Comprar ahora
                </button>
              )}
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Envío gratis</p>
                  <p className="text-sm text-secondary-600">En pedidos +$50</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Garantía</p>
                  <p className="text-sm text-secondary-600">1 año</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">Entrega</p>
                  <p className="text-sm text-secondary-600">24-48h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 mb-16">
         
          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Descripción' },
                { id: 'specifications', label: 'Especificaciones' },
                { id: 'reviews', label: 'Reseñas (12)' },
                { id: 'shipping', label: 'Envío y devoluciones' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-800 hover:border-secondary-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-secondary-700 leading-relaxed text-lg mb-6">
                  {product.description || 'Este producto cuenta con las mejores características del mercado, diseñado para ofrecerte la máxima calidad y durabilidad.'}
                </p>
                
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">Características principales:</h3>
                <ul className="list-disc list-inside space-y-2 text-secondary-700">
                  <li>Material de alta calidad y resistente</li>
                  <li>Diseño ergonómico y funcional</li>
                  <li>Fácil mantenimiento y limpieza</li>
                  <li>Garantía del fabricante incluida</li>
                  <li>Cumple con estándares internacionales de calidad</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Información general</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">SKU:</dt>
                      <dd className="font-medium text-secondary-900">ONX-{product.id.toString().padStart(6, '0')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Categoría:</dt>
                      <dd className="font-medium text-secondary-900 capitalize">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Peso:</dt>
                      <dd className="font-medium text-secondary-900">0.5 kg</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Dimensiones:</dt>
                      <dd className="font-medium text-secondary-900">20 x 15 x 10 cm</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Detalles técnicos</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Material:</dt>
                      <dd className="font-medium text-secondary-900">Premium Quality</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Color:</dt>
                      <dd className="font-medium text-secondary-900">Varios disponibles</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Garantía:</dt>
                      <dd className="font-medium text-secondary-900">12 meses</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-secondary-600">Origen:</dt>
                      <dd className="font-medium text-secondary-900">Importado</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-secondary-900">Reseñas de clientes</h3>
                  <button className="btn-primary">
                    Escribir reseña
                  </button>
                </div>
                
               
                <div className="bg-secondary-50 rounded-lg p-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-900">{product.rating || 4.8}</div>
                      <div className="flex items-center justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-sm text-secondary-600 mt-1">12 reseñas</div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center space-x-3">
                          <span className="text-sm text-secondary-600 w-8">{stars}★</span>
                          <div className="flex-1 bg-secondary-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-secondary-600 w-8">
                            {stars === 5 ? 8 : stars === 4 ? 3 : 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                
                <div className="space-y-6">
                  {[
                    { name: 'María García', rating: 5, date: '2024-01-15', comment: 'Excelente producto, muy buena calidad. Lo recomiendo 100%.' },
                    { name: 'Carlos López', rating: 4, date: '2024-01-10', comment: 'Muy buen producto, llegó rápido y en perfectas condiciones.' },
                    { name: 'Ana Martínez', rating: 5, date: '2024-01-05', comment: 'Superó mis expectativas. Volveré a comprar sin duda.' }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-secondary-200 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {review.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900">{review.name}</div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                              </div>
                              <span className="text-sm text-secondary-600">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-secondary-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Opciones de envío</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">Envío estándar gratis</p>
                        <p className="text-sm text-secondary-600">En pedidos superiores a $50. Entrega en 3-5 días hábiles.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">Envío express - $10</p>
                        <p className="text-sm text-secondary-600">Entrega en 24-48 horas en área metropolitana.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">Entrega programada - $5</p>
                        <p className="text-sm text-secondary-600">Elige el día y hora de entrega que prefieras.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Política de devoluciones</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">30 días para devoluciones</p>
                        <p className="text-sm text-secondary-600">Devoluciones gratuitas en productos con defectos.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">Garantía de satisfacción</p>
                        <p className="text-sm text-secondary-600">Si no estás satisfecho, te devolvemos tu dinero.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium text-secondary-900">Soporte 24/7</p>
                        <p className="text-sm text-secondary-600">Estamos aquí para ayudarte con cualquier problema.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

       
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">
                Productos relacionados
              </h2>
              <Link 
                to={`/products?category=${product.category}`}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Ver más en {product.category}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4 lg:hidden z-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-secondary-600">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-lg border transition-all ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-secondary-300 text-secondary-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || state.loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                product.stock === 0
                  ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {state.loading ? (
                <div className="loading-spinner"></div>
              ) : product.stock === 0 ? (
                'Sin stock'
              ) : (
                'Agregar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;