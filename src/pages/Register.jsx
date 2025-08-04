import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { authAPI, handleAPIError } from '../utils/api';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Datos adicionales

  // Redirect si ya está autenticado
  useEffect(() => {
    if (getters.isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [getters.isAuthenticated, navigate]);

  const validateStep1 = () => {
    const newErrors = {};

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Nombre
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    // Apellido
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Teléfono (opcional pero si se llena, validar formato)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono no válido';
    }

    // Código postal (opcional pero si se llena, validar)
    if (formData.postal_code && !/^\d{4,6}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Código postal debe tener entre 4 y 6 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    actions.setLoading(true);
    actions.clearError();

    try {
      // Preparar datos para enviar (sin confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await authAPI.register(dataToSend);
      const { user, access_token } = response.data;
      
      actions.login(user, access_token);
      toast.success('¡Cuenta creada exitosamente! Bienvenido a Onix 2.0');
      navigate('/', { replace: true });
      
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) {
      return { strength, text: 'Débil', color: 'text-red-600' };
    } else if (strength <= 3) {
      return { strength, text: 'Media', color: 'text-yellow-600' };
    } else {
      return { strength, text: 'Fuerte', color: 'text-green-600' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-gradient">
            Onix 2.0
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Crea tu cuenta
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-600'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`w-16 h-1 mx-2 ${
              step >= 2 ? 'bg-primary-600' : 'bg-secondary-200'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {state.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-6">
            {step === 1 ? (
              // STEP 1: Datos básicos
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900">Datos básicos</h3>
                  <p className="text-sm text-secondary-600">Información esencial para tu cuenta</p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
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

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Nombre *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`input-field pl-10 ${errors.first_name ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Juan"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`input-field ${errors.last_name ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Pérez"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-secondary-600">Seguridad:</span>
                        <span className={passwordStrength.color}>{passwordStrength.text}</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            passwordStrength.strength <= 2 ? 'bg-red-500' :
                            passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-base font-medium"
                >
                  Continuar
                </button>
              </>
            ) : (
              // STEP 2: Datos adicionales
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900">Información adicional</h3>
                  <p className="text-sm text-secondary-600">Datos opcionales para mejorar tu experiencia</p>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-secondary-400 w-5 h-5" />
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field pl-10 resize-none"
                      placeholder="Calle, número, colonia..."
                    />
                  </div>
                </div>

                {/* City and Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu ciudad"
                    />
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-secondary-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className={`input-field ${errors.postal_code ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="12345"
                    />
                    {errors.postal_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-secondary-700">
                      Acepto los{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                        Términos de Servicio
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                        Política de Privacidad
                      </a>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 btn-secondary py-3 text-base font-medium"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className={`flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 ${
                      state.loading
                        ? 'bg-secondary-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-lg'
                    }`}
                  >
                    {state.loading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Creando...
                      </div>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-secondary-600">
            Los campos marcados con * son obligatorios
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;