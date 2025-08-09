import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent mb-4">
              Onix 2.0
            </h3>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Tu tienda online de confianza. Productos de calidad con la mejor experiencia de compra.
            </p>
          </div>

          
          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-secondary-300 hover:text-primary-400 transition-colors">Inicio</Link></li>
              <li><Link to="/products" className="text-secondary-300 hover:text-primary-400 transition-colors">Productos</Link></li>
              <li><Link to="/products?category=clothing" className="text-secondary-300 hover:text-primary-400 transition-colors">Ropa</Link></li>
            </ul>
          </div>

         
          <div>
            <h4 className="font-semibold text-white mb-4">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="text-secondary-300 hover:text-primary-400 transition-colors">Perfil</Link></li>
              <li><Link to="/orders" className="text-secondary-300 hover:text-primary-400 transition-colors">Mis Pedidos</Link></li>
              <li><Link to="/cart" className="text-secondary-300 hover:text-primary-400 transition-colors">Carrito</Link></li>
              <li><Link to="/login" className="text-secondary-300 hover:text-primary-400 transition-colors">Iniciar Sesión</Link></li>
            </ul>
          </div>

          
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-secondary-300">
                <Mail className="w-4 h-4 mr-2" />
                OnixViral2@gmail.com
              </li>
              <li className="flex items-center text-secondary-300">
                <Phone className="w-4 h-4 mr-2" />
                +34 621 327 909
              </li>
              <li className="flex items-center text-secondary-300">
                <MapPin className="w-4 h-4 mr-2" />
                España ESP
              </li>
            </ul>
          </div>
        </div>

        
        <div className="border-t border-secondary-700 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              &copy; 2024 Onix 2.0. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                Términos de Servicio
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    
      <div className="bg-secondary-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-secondary-300 text-sm flex items-center justify-center">
            Hecho con <Heart className="w-4 h-4 mx-1 text-red-500" /> para una mejor experiencia de compra
          </p>
        </div>
      </div>
    </footer>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
