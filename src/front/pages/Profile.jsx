import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { authAPI, handleAPIError } from '../utils/api';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Eye, EyeOff, Trash2, Shield, Bell, Package, Heart, Settings, LogOut, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', first_name: '', last_name: '', phone: '', address: '', city: '', postal_code: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [settings, setSettings] = useState({ email_notifications: true, sms_notifications: false, marketing_emails: true, order_updates: true, newsletter: true });

  useEffect(() => {
    if (!getters.isAuthenticated) { navigate('/login'); return; }
    if (state.user) {
      setFormData({ email: state.user.email || '', first_name: state.user.first_name || '', last_name: state.user.last_name || '', phone: state.user.phone || '', address: state.user.address || '', city: state.user.city || '', postal_code: state.user.postal_code || '' });
    }
  }, [getters.isAuthenticated, navigate, state.user]);

  const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };
  const handlePasswordChange = (field, value) => { setPasswordData(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email no válido';
    if (!formData.first_name.trim()) newErrors.first_name = 'Nombre es requerido';
    if (!formData.last_name.trim()) newErrors.last_name = 'Apellido es requerido';
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Formato de teléfono no válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(formData);
      actions.updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) { toast.error(handleAPIError(error)); } finally { setLoading(false); }
  };

  const handleLogout = () => { actions.logout(); toast.success('Sesión cerrada exitosamente'); navigate('/'); };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'wishlist', label: 'Favoritos', icon: Heart },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-secondary-200 hover:bg-secondary-50 transition-colors">
                <Camera className="w-4 h-4 text-secondary-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary-900">{state.user?.first_name} {state.user?.last_name}</h1>
              <p className="text-secondary-600">{state.user?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />Cuenta verificada
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary flex items-center">
                <Edit3 className="w-4 h-4 mr-2" />Editar
              </button>
              <button onClick={handleLogout} className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex items-center">
                <LogOut className="w-4 h-4 mr-2" />Salir
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'}`}>
                    <tab.icon className="w-4 h-4 mr-3" />{tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-secondary-900">Información Personal</h2>
                  {!isEditing && <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center"><Edit3 className="w-4 h-4 mr-2" />Editar</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-secondary-50' : ''} ${errors.email ? 'border-red-300' : ''}`} />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input type="text" value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-secondary-50' : ''} ${errors.first_name ? 'border-red-300' : ''}`} />
                    </div>
                    {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Apellido</label>
                    <input type="text" value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} disabled={!isEditing} className={`input-field ${!isEditing ? 'bg-secondary-50' : ''} ${errors.last_name ? 'border-red-300' : ''}`} />
                    {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                      <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-secondary-50' : ''} ${errors.phone ? 'border-red-300' : ''}`} placeholder="+52 123 456 7890" />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-secondary-400 w-4 h-4" />
                      <textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} disabled={!isEditing} rows={3} className={`input-field pl-10 resize-none ${!isEditing ? 'bg-secondary-50' : ''}`} placeholder="Calle, número, colonia..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Ciudad</label>
                    <input type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} disabled={!isEditing} className={`input-field ${!isEditing ? 'bg-secondary-50' : ''}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Código Postal</label>
                    <input type="text" value={formData.postal_code} onChange={(e) => handleInputChange('postal_code', e.target.value)} disabled={!isEditing} className={`input-field ${!isEditing ? 'bg-secondary-50' : ''}`} />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex space-x-4 mt-6 pt-6 border-t border-secondary-200">
                    <button onClick={handleSaveProfile} disabled={loading} className="btn-primary flex items-center">
                      {loading ? <div className="loading-spinner mr-2"></div> : <Save className="w-4 h-4 mr-2" />}Guardar Cambios
                    </button>
                    <button onClick={() => { setIsEditing(false); setErrors({}); }} className="btn-secondary flex items-center">
                      <X className="w-4 h-4 mr-2" />Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">Preferencias de Notificaciones</h2>
                <div className="space-y-6">
                  {[
                    { key: 'email_notifications', title: 'Notificaciones por email', description: 'Recibir notificaciones importantes por correo electrónico' },
                    { key: 'sms_notifications', title: 'Notificaciones por SMS', description: 'Recibir notificaciones por mensaje de texto' },
                    { key: 'order_updates', title: 'Actualizaciones de pedidos', description: 'Notificaciones sobre el estado de tus pedidos' },
                    { key: 'marketing_emails', title: 'Emails promocionales', description: 'Recibir ofertas especiales y promociones' },
                    { key: 'newsletter', title: 'Newsletter', description: 'Recibir nuestro boletín mensual con novedades' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-secondary-900">{setting.title}</h3>
                        <p className="text-sm text-secondary-600">{setting.description}</p>
                      </div>
                      <button onClick={() => setSettings(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[setting.key] ? 'bg-primary-600' : 'bg-secondary-200'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings[setting.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <button onClick={() => toast.success('Preferencias guardadas')} className="btn-primary">Guardar Preferencias</button>
                </div>
              </div>
            )}

            {['orders', 'wishlist'].includes(activeTab) && (
              <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                  {activeTab === 'orders' ? 'Historial de Pedidos' : 'Lista de Favoritos'}
                </h2>
                <div className="text-center py-12">
                  {activeTab === 'orders' ? <Package className="w-12 h-12 text-secondary-400 mx-auto mb-4" /> : <Heart className="w-12 h-12 text-secondary-400 mx-auto mb-4" />}
                  <p className="text-secondary-600">{activeTab === 'orders' ? 'No tienes pedidos aún' : 'No tienes productos favoritos'}</p>
                  <button onClick={() => navigate('/products')} className="btn-primary mt-4">
                    {activeTab === 'orders' ? 'Explorar Productos' : 'Descubrir Productos'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;