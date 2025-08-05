import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { productsAPI, handleAPIError } from '../utils/api.js';
import { 
  Package, 
  Upload, 
  DollarSign, 
  Hash, 
  FileText, 
  Tag,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AddProduct = () => {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      console.log('Categories from API:', response.data || response);
      setCategories(response.data || response);
    } catch (error) {
      console.error('Error loading categories (using fallback):', error);
      // Fallback con las categorías que sabemos que existen
      const fallbackCategories = [
        { value: "anillos", label: "Anillos" },
        { value: "collares", label: "Collares" },
        { value: "pendientes", label: "Pendientes" },
        { value: "pulseras", label: "Pulseras" },
        { value: "relojes", label: "Relojes" }
      ];
      setCategories(fallbackCategories);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'El nombre del producto es obligatorio' });
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'El precio debe ser mayor a 0' });
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setMessage({ type: 'error', text: 'El stock debe ser mayor o igual a 0' });
      return false;
    }
    if (!formData.category) {
      setMessage({ type: 'error', text: 'Selecciona una categoría' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock),
        category_id: formData.category,
        image_url: formData.image_url.trim() || null
      };

      console.log('Sending product data:');
      console.log(JSON.stringify(productData, null, 2));

      const response = await productsAPI.createProduct(productData);
      console.log('Product created successfully:');
      console.log(JSON.stringify(response, null, 2));

      actions.addProduct(response.data);
      setMessage({ type: 'success', text: 'Producto creado exitosamente' });
      
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_url: ''
      });

      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (error) {
      console.log('=== ERROR DETAILS ===');
      console.log('Full error object:');
      console.log(JSON.stringify(error, null, 2));
      console.log('Error response:');
      console.log(JSON.stringify(error.response, null, 2));
      console.log('Error response data:');
      console.log(JSON.stringify(error.response?.data, null, 2));
      console.log('Error message:', error.message);
      console.log('Error status:', error.response?.status);
      
      let errorMessage = 'Error al crear el producto';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = handleAPIError(error);
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image_url: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Package className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Añadir Producto</h1>
              <p className="text-secondary-600 mt-1">Crea un nuevo producto para tu tienda</p>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
                Información Básica
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Collar de plata elegante"
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe tu producto, materiales, características especiales..."
                  rows={4}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category, index) => (
                    <option key={category.id || category.value || index} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
                Precio y Disponibilidad
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
                Imagen del Producto
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="text-center">
                  <div className="text-sm text-secondary-500 mb-2">o</div>
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                      <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                      <div className="text-sm text-secondary-600">
                        <span className="font-medium text-primary-600">Subir imagen</span> o arrastra aquí
                      </div>
                      <div className="text-xs text-secondary-500 mt-1">PNG, JPG hasta 10MB</div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.image_url && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Vista previa:
                    </label>
                    <div className="w-32 h-32 border border-secondary-300 rounded-lg overflow-hidden bg-secondary-50">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Crear Producto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;