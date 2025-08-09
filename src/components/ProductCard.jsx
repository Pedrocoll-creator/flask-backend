import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { cartAPI, handleAPIError, formatPrice } from '../utils/api';
import { 
  Star, 
  Heart, 
  ShoppingCart,
  Eye,
  ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ product, variant = 'default', className = '' }) => {
  const { getters, actions } = useStore();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  
  const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
  

  const getImageUrl = () => {
    if (imageError) return defaultImage;
    return product.image_url || product.image || defaultImage;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!getters.isAuthenticated) {
      toast.info('Inicia sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    if (product.stock === 0) {
      toast.warning('Producto sin stock');
      return;
    }

    try {
      actions.setLoading(true);
      await cartAPI.addToCart({ product_id: product.id, quantity: 1 });
      actions.addToCart({
        id: Date.now(),
        product_id: product.id,
        product: product,
        quantity: 1
      });
      toast.success(`${product.name} agregado al carrito`);
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      actions.setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (variant === 'detailed') {
  
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
            {imageLoading && (
              <div className="absolute inset-0 bg-secondary-200 animate-pulse flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-secondary-400" />
              </div>
            )}
            <img
              src={getImageUrl()}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="w-4 h-4 text-secondary-600 hover:text-red-500" />
              </button>
              <Link 
                to={`/product/${product.id}`}
                className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors block"
              >
                <Eye className="w-4 h-4 text-secondary-600 hover:text-primary-600" />
              </Link>
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ¡Últimas unidades!
                </span>
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Agotado
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-600">(4.8)</span>
                </div>
                
                <h3 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  <Link to={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
                
                <p className="text-secondary-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-secondary-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      product.stock === 0
                        ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="relative overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 bg-secondary-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-secondary-400" />
          </div>
        )}
        <img
          src={getImageUrl()}
          alt={product.name}
          className={`w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-secondary-600 hover:text-red-500" />
          </button>
          <Link 
            to={`/product/${product.id}`}
            className="p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors block"
          >
            <Eye className="w-4 h-4 text-secondary-600 hover:text-primary-600" />
          </Link>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              ¡Últimas unidades!
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Agotado
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-secondary-600">(4.8)</span>
        </div>
        
        <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        
        <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-secondary-500">
              Stock: {product.stock}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-lg transition-all duration-200 ${
              product.stock === 0
                ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:scale-105'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;