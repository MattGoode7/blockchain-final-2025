import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const FactoryOwnerPanel: React.FC = () => {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [registrationRequests, setRegistrationRequests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkOwnership();
  }, []);

  const checkOwnership = async () => {
    try {
      const address = await ethereumService.signer?.getAddress();
      if (address) {
        const requests = await ethereumService.getRegistrationRequests();
        setRegistrationRequests(requests);
        setIsOwner(requests !== null); // Si podemos obtener las solicitudes, somos el dueño
      }
    } catch (err) {
      setIsOwner(false);
    }
  };

  const handleAuthorize = async (address: string) => {
    setError(null);
    setLoading(true);
    try {
      await ethereumService.authorizeRegistration(address);
      await checkOwnership(); // Recargar las solicitudes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al autorizar registro');
    } finally {
      setLoading(false);
    }
  };

  if (isOwner === null) {
    return null; // No mostrar nada mientras verificamos
  }

  if (!isOwner) {
    return null; // No mostrar nada si no es el dueño
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-2xl shadow-xl border border-slate-200 transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="bg-primary/10 rounded-full p-3 mb-2">
          <UserCircleIcon className="h-10 w-10 text-primary" />
        </div>
        <h5 className="text-2xl font-bold text-slate-800 mb-0">Panel de Administración</h5>
      </div>
      
      <div className="w-full max-w-md">
        <h6 className="text-lg font-semibold text-slate-700 mb-4 text-center">
          Solicitudes de Registro
        </h6>
        
        {registrationRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">
              <UserCircleIcon className="h-12 w-12 mx-auto mb-3" />
            </div>
            <p className="text-slate-500 font-medium">No hay solicitudes pendientes</p>
            <p className="text-sm text-slate-400 mt-1">Los usuarios aparecerán aquí cuando se registren</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrationRequests.map((address, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                  <div className="font-mono text-sm text-slate-800 break-all">
                    {address}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Dirección de wallet
                  </div>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  onClick={() => handleAuthorize(address)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Autorizando...
                    </>
                  ) : (
                    'Autorizar'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="w-full p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
          Error: {error}
        </div>
      )}
    </div>
  );
}; 