import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { productsAPI, handleAPIError } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Grid, 
  List,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const Products = () => {
  const { state } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  
  // Estados de filtros y UI
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Opciones de ordenamiento
  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'name_desc', label: 'Nombre Z-A' },
    { value: 'price', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'created_at', label: 'Más Recientes' },
    { value: 'stock', label: 'Stock Disponible' }
  ];

  // Efectos
  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  useEffect(() => {
    // Actualizar URL cuando cambien los filtros
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, pagination.page]);

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        per_page: 12,
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || 'name'
      };

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset page when searching
    setSearchParams(params);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setPriceRange([0, 1000]);
    setSearchParams(new URLSearchParams());
    setFiltersApplied(false);
  };

  // Aplicar filtros de precio (ejemplo de filtro local)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filtro de precio local (opcional)
    if (filtersApplied) {
      filtered = filtered.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
    
    return filtered;
  }, [products, priceRange, filtersApplied]);

  // Manejar paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const params = new URLSearchParams(searchParams);
      if (newPage > 1) {
        params.set('page', newPage.toString());
      } else {
        params.delete('page');
      }
      setSearchParams(params);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                {selectedCategory 
                  ? `${state.categories.find(cat => cat.value === selectedCategory)?.label || 'Productos'}`
                  : 'Todos los Productos'
                }
              </h1>
              <p className="text-secondary-600 mt-1">
                {pagination.total > 0 
                  ? `${pagination.total} productos encontrados`
                  : 'Cargando productos...'
                }
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="lg:max-w-md w-full">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-lg bg-white hover:bg-secondary-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
                <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-6 space-y-6 ${showFilters || 'hidden lg:block'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Filtros</h3>
                {(searchTerm || selectedCategory || sortBy !== 'name') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Categorías</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Todas</span>
                  </label>
                  {state.categories.map((category) => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={selectedCategory === category.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-secondary-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Rango de Precio</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-secondary-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-secondary-500">-</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="w-full px-3 py-2 border border-secondary-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => setFiltersApplied(true)}
                    className="w-full btn-primary py-2 text-sm"
                  >
                    Aplicar Filtro
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-3">Disponibilidad</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <span className="ml-2 text-sm text-secondary-700">En stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                    <span className="ml-2 text-sm text-secondary-700">Envío gratis</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                </div>
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden animate-pulse">
                    <div className="bg-secondary-200 h-48"></div>
                    <div className="p-4">
                      <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                      <div className="h-4 bg-secondary-200 rounded w-2/3 mb-4"></div>
                      <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={viewMode === 'list' ? 'detailed' : 'default'}
                      className={viewMode === 'list' ? 'flex flex-row' : ''}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pagination.has_prev
                          ? 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-300'
                          : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      }`}
                    >
                      Anterior
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(pagination.pages)].map((_, index) => {
                      const pageNum = index + 1;
                      const isCurrentPage = pageNum === pagination.page;
                      
                      // Show only relevant page numbers
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.pages ||
                        (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isCurrentPage
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === pagination.page - 3 ||
                        pageNum === pagination.page + 3
                      ) {
                        return (
                          <span key={pageNum} className="px-2 py-2 text-secondary-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pagination.has_next
                          ? 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-300'
                          : 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}

                {/* Results info */}
                <div className="mt-8 text-center text-sm text-secondary-600">
                  Mostrando {((pagination.page - 1) * pagination.per_page) + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total} productos
                </div>
              </>
            ) : (
              /* No results */
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-secondary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    No hay productos que coincidan con tus criterios de búsqueda.
                    Intenta cambiar los filtros o términos de búsqueda.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={clearFilters}
                      className="block w-full btn-primary"
                    >
                      Limpiar filtros
                    </button>
                    <button
                      onClick={() => navigate('/products')}
                      className="block w-full btn-secondary"
                    >
                      Ver todos los productos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 z-40"
        title="Volver arriba"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default Products;