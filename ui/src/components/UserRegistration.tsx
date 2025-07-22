import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';
import { UserCircleIcon } from '@heroicons/react/24/outline'

interface UserRegistrationProps {
  isOwner: boolean;
  isAuthorized: boolean;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({ isOwner, isAuthorized }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Estados para el registro ENS
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [ensService, setEnsService] = useState<any>(null);
  const [ensRegistered, setEnsRegistered] = useState(false);
  const [ensReceipt, setEnsReceipt] = useState<string | null>(null);

  useEffect(() => {
    const initializeENSService = async () => {
      const service = ethereumService.getENSService();
      if (service) {
        setEnsService(service);
      }
    };

    initializeENSService();
  }, []);

  useEffect(() => {
    const checkNameAvailability = async () => {
      if (userName && ensService) {
        try {
          const fullName = `${userName}.usuarios.cfp`;
          const available = await ensService.isNameAvailable(fullName);
          setIsNameAvailable(available);
        } catch (error) {
          console.error('Error al verificar disponibilidad:', error);
          setIsNameAvailable(null);
        }
      } else {
        setIsNameAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkNameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [userName, ensService]);

  const handleENSRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ensService) {
      setError('Error: Servicio ENS no inicializado');
      return;
    }

    if (!userName.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }

    if (isNameAvailable === false) {
      setError('El nombre de usuario ya está registrado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const receipt = await ensService.registerUserNameWithMetaMask(userName, description);
      
      setEnsRegistered(true);
      setEnsReceipt(receipt.hash);
      setError('');
    } catch (err) {
      setError(`Error al registrar nombre ENS: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!ensRegistered) {
      setError('Debes registrar tu nombre ENS antes de solicitar autorización');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await ethereumService.registerAccount();
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autorizado o es owner, no mostrar nada
  if (isAuthorized || isOwner) {
    return null;
  }

  const getAvailabilityMessage = () => {
    if (isNameAvailable === null) return null;
    if (isNameAvailable) {
      return <span className="text-green-600 text-sm">✓ Nombre disponible</span>;
    } else {
      return <span className="text-red-600 text-sm">✗ Nombre no disponible</span>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-xl border border-slate-200 transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="bg-primary/10 rounded-full p-3 mb-2">
          <UserCircleIcon className="h-10 w-10 text-primary" />
        </div>
        <h5 className="text-2xl font-bold text-white mb-0">Registro de Usuario con ENS</h5>
      </div>
      
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {success ? (
          <div className="w-full p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg text-center font-semibold">
            Solicitud de registro enviada correctamente.<br/>Espera la autorización del administrador.
          </div>
        ) : (
          <>
            <p className="text-center text-base text-white mb-4">
              Para poder crear llamados y presentar propuestas, necesitas registrarte con un nombre ENS y solicitar autorización.
            </p>

            {/* Paso 1: Registro ENS */}
            {!ensRegistered && (
              <div className="w-full space-y-4">
                <h6 className="text-lg font-semibold text-white">Paso 1: Registra tu nombre ENS</h6>
                
                <form onSubmit={handleENSRegistration} className="space-y-4">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-white mb-2">
                      Nombre de Usuario
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mi-nombre"
                        disabled={loading}
                      />
                      <span className="text-gray-500 text-sm">.usuarios.cfp</span>
                    </div>
                    {getAvailabilityMessage()}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Breve descripción sobre ti..."
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !userName.trim() || isNameAvailable === false}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Registrando ENS...
                      </>
                    ) : (
                      'Registrar Nombre ENS'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Paso 2: Solicitar autorización */}
            {ensRegistered && (
              <div className="w-full space-y-4">
                <div className="w-full p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="font-semibold mb-2">✓ Nombre ENS registrado exitosamente</div>
                  <div className="text-sm">Hash: {ensReceipt}</div>
                </div>

                <h6 className="text-lg font-semibold text-slate-700">Paso 2: Solicitar autorización</h6>
                <p className="text-center text-sm text-slate-600">
                  Ahora puedes solicitar autorización para crear llamados y presentar propuestas.
                </p>

                <button
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Solicitando autorización...
                    </>
                  ) : (
                    'Solicitar Autorización'
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="w-full p-3 mt-3 text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
                Error: {error}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600 max-w-md">
        <h3 className="font-semibold mb-2">Información del proceso:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Primero registras tu nombre ENS en el dominio usuarios.cfp</li>
          <li>Luego solicitas autorización al administrador</li>
          <li>Una vez autorizado, podrás crear llamados y presentar propuestas</li>
          <li>Tu nombre ENS será visible en lugar de tu dirección</li>
        </ul>
      </div>
    </div>
  );
}; 