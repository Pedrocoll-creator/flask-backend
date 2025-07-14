import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  LogOut,
  Settings,
  Package,
  Plus
} from 'lucide-react';

const Navbar = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    actions.logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600' : 'text-secondary-600 hover:text-primary-600';
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
              >
                Onix 2.0
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors ${isActive('/')}`}
              >
                Inicio
              </Link>
              <Link 
                to="/products" 
                className={`font-medium transition-colors ${isActive('/products')}`}
              >
                Productos
              </Link>
              <div className="relative group">
                <button className="font-medium text-secondary-600 hover:text-primary-600 transition-colors">
                  Categorías
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    {state.categories.map((category) => (
                      <Link
                        key={category.value}
                        to={`/products?category=${category.value}`}
                        className="block px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                to="/cart" 
                className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {getters.cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {getters.cartCount}
                  </span>
                )}
              </Link>

              {getters.isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {state.user?.first_name}
                    </span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-10">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Mi Perfil
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Mis Pedidos
                        </Link>
                        <Link
                          to="/add-product"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Añadir Producto
                        </Link>
                        <hr className="my-2 border-secondary-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-sm"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-secondary-200">
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>

              <div className="space-y-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  Inicio
                </Link>
                <Link 
                  to="/products" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-secondary-600 hover:text-primary-600 transition-colors"
                >
                  Productos
                </Link>
                
                <div className="space-y-1">
                  <div className="py-2 text-secondary-800 font-medium">Categorías</div>
                  {state.categories.map((category) => (
                    <Link
                      key={category.value}
                      to={`/products?category=${category.value}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 pl-4 text-sm text-secondary-600 hover:text-primary-600 transition-colors"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {(isMenuOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;