import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { authAPI, handleAPIError } from '../utils/api.js';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Shield,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const MyProfile = () => {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  useEffect(() => {
    if (state.user) {
      setFormData({
        first_name: state.user.first_name || '',
        last_name: state.user.last_name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        address: state.user.address || '',
        city: state.user.city || '',
        postal_code: state.user.postal_code || ''
      });
    }
  }, [state.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Updating profile with data:', formData);
      
      const response = await authAPI.updateProfile(formData);
      console.log('Profile update response:', response);
      
      actions.updateUser(response.data?.user || response.data);
      
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
      setIsEditing(false);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error al actualizar perfil';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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

  const handleCancel = () => {
    if (state.user) {
      setFormData({
        first_name: state.user.first_name || '',
        last_name: state.user.last_name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        address: state.user.address || '',
        city: state.user.city || '',
        postal_code: state.user.postal_code || ''
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      setMessage({ type: 'error', text: 'Debes escribir "ELIMINAR" para confirmar' });
      return;
    }

    setDeleteLoading(true);
    
    try {
      await authAPI.deleteAccount();
      
      actions.logout();
      
      navigate('/register', { 
        state: { 
          message: { 
            type: 'success', 
            text: 'Tu cuenta ha sido eliminada exitosamente' 
          } 
        } 
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      
      let errorMessage = 'Error al eliminar la cuenta';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = handleAPIError(error);
      }
      
      setMessage({ type: 'error', text: errorMessage });
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-lg">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Mi Perfil</h1>
              <p className="text-secondary-600 mt-1">Gestiona tu información personal</p>
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
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-semibold">
                    {state.user?.first_name} {state.user?.last_name}
                  </h2>
                  <p className="text-primary-100 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {state.user?.email}
                  </p>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nombre
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                        {formData.first_name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Apellidos
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                        {formData.last_name || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  ) : (
                    <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900 flex items-center">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      {formData.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                      {formData.phone || 'No especificado'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
                  <MapPin className="w-5 h-5 inline mr-1" />
                  Dirección
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Calle, número, piso..."
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                      {formData.address || 'No especificado'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Ciudad
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Madrid"
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                        {formData.city || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Código Postal
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="28001"
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-secondary-50 rounded-lg text-secondary-900">
                        {formData.postal_code || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Zona Peligrosa
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Las acciones realizadas aquí son irreversibles
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h4 className="text-lg font-medium text-secondary-900">
                  Eliminar cuenta
                </h4>
                <p className="text-sm text-secondary-600 mt-1">
                  Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.
                </p>
              </div>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 className="w-5 h-5" />
                <span>Eliminar Cuenta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    ¿Estás seguro?
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-secondary-700 mb-4">
                  Al eliminar tu cuenta:
                </p>
                <ul className="text-sm text-secondary-600 space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Se eliminarán todos tus datos personales
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Se cancelarán todos tus pedidos pendientes
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Perderás acceso a tu historial de compras
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    No podrás recuperar tu cuenta
                  </li>
                </ul>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Para confirmar, escribe "ELIMINAR" en el campo:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="ELIMINAR"
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'ELIMINAR' || deleteLoading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Eliminar Cuenta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;