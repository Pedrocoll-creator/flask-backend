import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSystem from './components/OrderSystem';

function App() {
  return (
    <>
      <OrderSystem /> 
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<Checkout />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
                  <p className="text-secondary-600 mb-8">Página no encontrada</p>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="btn-primary"
                  >
                    Ir al Inicio
                  </button>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
