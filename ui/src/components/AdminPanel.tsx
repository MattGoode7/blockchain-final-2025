import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useENSResolution } from '../hooks/useENSResolution';

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolveAddresses, getDisplayName, loading: ensLoading } = useENSResolution();

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let requests = await ethereumService.getRegistrationRequests();
      // Si la respuesta es null/undefined, forzar array vacío
      if (!Array.isArray(requests)) {
        requests = [];
      }
      setRequests(requests);

      // Resolver nombres ENS de los usuarios que solicitan autorización
      if (requests.length > 0) {
        await resolveAddresses(requests);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        throw new Error('Dirección inválida para autorizar');
      }
      await ethereumService.authorizeRegistration(address);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al autorizar registro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300">
        <div className="flex flex-col items-center justify-center gap-6 p-8">
          <div className="spinner-border text-blue-400" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-gray-300">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300">
        <div className="flex flex-col items-center justify-center gap-6 p-8">
          <div className="w-full p-4 text-red-300 bg-red-900/50 border border-red-600 rounded-lg text-center text-sm">
            Error: {error}
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            onClick={loadRequests}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="bg-blue-400/10 rounded-full p-3 mb-2">
          <UserCircleIcon className="h-10 w-10 text-blue-400" />
        </div>
        <h5 className="text-xl sm:text-2xl font-bold text-white mb-0">Panel de Administración</h5>
      </div>
      
      <div className="w-full">
        <h6 className="text-lg font-semibold text-white mb-6 text-center">
          Solicitudes de Registro
        </h6>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <UserCircleIcon className="h-12 w-12 mx-auto mb-3" />
            </div>
            <p className="text-gray-300 font-medium">No hay solicitudes pendientes</p>
            <p className="text-sm text-gray-400 mt-1">Los usuarios aparecerán aquí cuando se registren</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((address, index) => {
              const displayName = getDisplayName(address);
              const showAddress = !displayName || displayName === `${address.slice(0, 6)}...${address.slice(-4)}`;
              
              return (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                    <div className="font-mono text-sm text-white break-all">
                      {ensLoading ? (
                        <span className="animate-pulse">Cargando...</span>
                      ) : (
                        <>
                          {displayName}
                          {!showAddress && (
                            <span className="text-gray-400 ml-2">
                              ({address.slice(0, 6)}...{address.slice(-4)})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {showAddress ? 'Dirección de wallet' : 'Usuario registrado con ENS'}
                    </div>
                  </div>
                  <button
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 