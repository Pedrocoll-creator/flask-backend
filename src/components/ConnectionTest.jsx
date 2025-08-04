import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useStore } from '../store';

const ConnectionTest = () => {
  const { state } = useStore();
  const [testResults, setTestResults] = useState({
    health: null,
    categories: null,
    products: null,
    error: null
  });
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults({ health: null, categories: null, products: null, error: null });
    
    try {
      const healthData = await apiService.healthCheck();
      setTestResults(prev => ({ ...prev, health: healthData }));

      const categoriesData = await apiService.getCategories();
      setTestResults(prev => ({ ...prev, categories: categoriesData }));

      const productsData = await apiService.getProducts({ per_page: 3 });
      setTestResults(prev => ({ ...prev, products: productsData }));

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        error: error.response?.data?.message || error.message 
      }));
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔌 Test de Conexión</h1>
        <h2 className="text-2xl text-blue-600 font-semibold">Onix 2.0 E-commerce</h2>
      </div>
      
      <div className="grid gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">📊 Estado de la Aplicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Frontend</div>
              <div className="text-blue-600">{window.location.origin}</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Backend</div>
              <div className="text-blue-600">{API_URL || '/api'}</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Token</div>
              <div className={state.token ? 'text-green-600' : 'text-red-600'}>
                {state.token ? '✅ Presente' : '❌ No hay token'}
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Usuario</div>
              <div className={state.user ? 'text-green-600' : 'text-orange-600'}>
                {state.user ? `✅ ${state.user.email}` : '⚠️ No logueado'}
              </div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Carrito</div>
              <div className="text-blue-600">{state.cart.length} items</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="font-medium text-gray-700">Productos</div>
              <div className="text-blue-600">{state.products.length} cargados</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={runTests}
            disabled={testing}
            className={`px-8 py-4 rounded-lg font-medium text-lg ${
              testing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
            } text-white transition-all duration-200 shadow-lg`}
          >
            {testing ? '🔄 Ejecutando Pruebas...' : '🧪 Ejecutar Pruebas de Conexión'}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            {testResults.health ? '✅' : testResults.error ? '❌' : '⏳'} 
            <span className="ml-2">Health Check - Servidor</span>
          </h3>
          {testResults.health && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-green-800 font-medium mb-2">✅ Servidor funcionando correctamente</div>
              <pre className="bg-white p-3 rounded text-xs overflow-auto border">
                {JSON.stringify(testResults.health, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            {testResults.categories ? '✅' : testResults.error ? '❌' : '⏳'} 
            <span className="ml-2">Categorías - API</span>
          </h3>
          {testResults.categories && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-green-800 font-medium mb-2">✅ Categorías cargadas</div>
              <div className="flex flex-wrap gap-2">
                {testResults.categories.map((cat, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cat.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            {testResults.products ? '✅' : testResults.error ? '❌' : '⏳'} 
            <span className="ml-2">Productos - Base de Datos</span>
          </h3>
          {testResults.products && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-green-800 font-medium mb-2">
                ✅ {testResults.products.pagination?.total || 0} productos en total
              </div>
              <div className="grid gap-2">
                {testResults.products.products?.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex justify-between bg-white p-3 rounded border">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-gray-500 ml-2">({product.category})</span>
                    </div>
                    <span className="font-bold text-green-600">${product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {testResults.error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Error de Conexión</h3>
            <div className="bg-red-100 p-4 rounded border border-red-300">
              <p className="text-red-700 font-medium">{testResults.error}</p>
              <div className="mt-2 text-sm text-red-600">
                <strong>Posibles soluciones:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Verifica que el backend esté ejecutándose en puerto 3001</li>
                  <li>Revisa la configuración de CORS en Flask</li>
                  <li>Comprueba la configuración del proxy en Vite</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-3">🚀 ¡Conexión Lista!</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-700 mb-2">✨ Funcionalidades Disponibles:</h4>
            <ul className="text-green-600 space-y-1">
              <li>• 🛍️ Catálogo de productos</li>
              <li>• 🔐 Sistema de autenticación</li>
              <li>• 🛒 Carrito de compras</li>
              <li>• 💳 Checkout con Stripe</li>
              <li>• 👤 Perfil de usuario</li>
              <li>• 📦 Historial de órdenes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">🧭 Rutas Disponibles:</h4>
            <ul className="text-blue-600 space-y-1">
              <li>• <a href="/products" className="underline hover:text-blue-800">/products</a> - Catálogo</li>
              <li>• <a href="/register" className="underline hover:text-blue-800">/register</a> - Registro</li>
              <li>• <a href="/login" className="underline hover:text-blue-800">/login</a> - Iniciar sesión</li>
              <li>• <a href="/cart" className="underline hover:text-blue-800">/cart</a> - Carrito</li>
              <li>• <a href="/profile" className="underline hover:text-blue-800">/profile</a> - Perfil</li>
              <li>• <a href="/orders" className="underline hover:text-blue-800">/orders</a> - Mis órdenes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;