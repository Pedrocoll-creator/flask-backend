import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Shield, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { getters } = useStore();
  const location = useLocation();

  
  if (requireAuth && !getters.isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  
  if (!requireAuth && getters.isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  
  return children;
};

// Componente para mostrar mientras se verifica la autenticación
export const AuthLoadingSpinner = () => (
  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
        <Shield className="w-8 h-8 text-primary-600 animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-secondary-900 mb-2">
        Verificando acceso...
      </h2>
      <div className="loading-spinner mx-auto"></div>
    </div>
  </div>
);

// Componente para rutas no encontradas
export const NotFound = () => (
  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-secondary-900 mb-4">
        Página no encontrada
      </h2>
      <p className="text-secondary-600 mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <button
          onClick={() => window.history.back()}
          className="btn-secondary w-full sm:w-auto"
        >
          Volver Atrás
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-primary w-full sm:w-auto"
        >
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
);

// Componente para acceso denegado
export const AccessDenied = ({ message = "No tienes permisos para acceder a esta página" }) => (
  <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
        <Shield className="w-10 h-10 text-yellow-600" />
      </div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-4">
        Acceso Denegado
      </h1>
      <p className="text-secondary-600 mb-8">
        {message}
      </p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <button
          onClick={() => window.history.back()}
          className="btn-secondary w-full sm:w-auto"
        >
          Volver Atrás
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-primary w-full sm:w-auto"
        >
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
);

export default ProtectedRoute;