import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { authAPI, handleAPIError } from '../utils/api';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  
  useEffect(() => {
    if (getters.isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [getters.isAuthenticated, navigate, location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    actions.setLoading(true);
    actions.clearError();

    try {
      const response = await authAPI.login(formData);
      const { user, access_token } = response.data;
      
      actions.login(user, access_token);
      toast.success('¡Bienvenido de vuelta!');
      
     
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      const errorMessage = handleAPIError(error);
      actions.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      actions.setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
   
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
      
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-gradient">
            Onix 2.0
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Inicia sesión en tu cuenta
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

       
        <div className="bg-white rounded-xl shadow-lg p-8">
          {state.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
          
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

           
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Recordar sesión
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

         
            <div>
              <button
                type="submit"
                disabled={state.loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                  state.loading
                    ? 'bg-secondary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-lg'
                }`}
              >
                {state.loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

         
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Cuentas de prueba:</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@onix.com / admin123</p>
              <p><strong>Usuario:</strong> user@test.com / test123</p>
            </div>
          </div>
        </div>

      
        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Al iniciar sesión, aceptas nuestros{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;