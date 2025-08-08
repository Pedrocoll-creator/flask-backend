import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const ProductImage = ({ src, alt, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const fallbackImages = [
    'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Producto',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    '/placeholder-product.jpg'
  ];

  const getImageUrl = (url) => {
    if (!url) return fallbackImages[0];
    
    if (url.includes('encrypted-tbn') || 
        url.includes('gstatic.com') || 
        url.includes('googleusercontent.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  const currentSrc = hasError && fallbackIndex < fallbackImages.length 
    ? fallbackImages[fallbackIndex] 
    : getImageUrl(src);

  const handleError = () => {
    setIsLoading(false);
    
    if (fallbackIndex < fallbackImages.length - 1) {
      setFallbackIndex(fallbackIndex + 1);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
      />
      
      {hasError && fallbackIndex >= fallbackImages.length - 1 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Imagen no disponible</span>
        </div>
      )}
    </div>
  );
};

export default ProductImage;