import React, { useState } from 'react';
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

  const handleRegister = async () => {
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

  // Si es owner o ya está autorizado, no mostrar el botón
  if (isOwner || isAuthorized) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-200 transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="bg-primary/10 rounded-full p-3 mb-2">
          <UserCircleIcon className="h-10 w-10 text-primary" />
        </div>
        <h5 className="text-2xl font-bold text-slate-800 mb-0">Registro de Usuario</h5>
      </div>
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {success ? (
          <div className="w-full p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg text-center font-semibold">
            Solicitud de registro enviada correctamente.<br/>Espera la autorización del administrador.
          </div>
        ) : (
          <>
            <p className="text-center text-base text-slate-600 mb-4">
              Para poder crear llamados y presentar propuestas, necesitas registrarte como usuario autorizado.
            </p>
            <button
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Registrando...
                </>
              ) : (
                'Registrarme'
              )}
            </button>
            {error && (
              <div className="w-full p-3 mt-3 text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
                Error: {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 