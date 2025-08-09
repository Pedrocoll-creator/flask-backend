import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { userAPI, handleAPIError } from '../utils/api';
import { toast } from 'react-toastify';
import { User, Edit, Trash2, Home, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import Modal from '../components/Modal'; // Asume que tienes un componente Modal

const MyProfile = () => {
  const { state, actions, getters } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!getters.isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [getters.isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      toast.error(handleAPIError(error));
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await userAPI.deleteProfile();
      actions.logout();
      toast.success('Tu cuenta ha sido eliminada exitosamente.');
      navigate('/');
    } catch (error) {
      toast.error(handleAPIError(error));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center text-center">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-secondary-200">
          <p className="text-secondary-600">No se pudo cargar la información del perfil.</p>
          <button onClick={() => navigate('/login')} className="mt-4 btn-primary">
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-primary-600 text-white rounded-full flex items-center justify-center">
            <User className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">{profile.first_name} {profile.last_name}</h1>
          <p className="text-secondary-600">{profile.email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-secondary-900">Información de contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 text-secondary-700">
              <Mail className="w-5 h-5 text-primary-600" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-secondary-700">
              <Phone className="w-5 h-5 text-primary-600" />
              <span>{profile.phone || 'No especificado'}</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-secondary-900 mt-8">Dirección de envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 text-secondary-700">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>{profile.address || 'No especificado'}</span>
            </div>
            <div className="flex items-center space-x-3 text-secondary-700">
              <Home className="w-5 h-5 text-primary-600" />
              <span>{profile.city || 'No especificado'}, {profile.postal_code || '---'}, {profile.country || '---'}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/edit-profile')}
            className="flex-1 btn-secondary flex items-center justify-center"
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar Perfil
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 btn-danger flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Eliminar Cuenta
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación de cuenta"
      >
        <p className="text-secondary-600 mb-6">
          ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.
        </p>
        <div className="flex justify-end space-x-4">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleDeleteAccount} className="btn-danger" disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyProfile;