import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';

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
        setRegistrationRequests(requests.map((req: { address: string }) => req.address));
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
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold mb-4">Panel de Administración</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Solicitudes de Registro</h3>
        {registrationRequests.length === 0 ? (
          <p className="text-gray-500">No hay solicitudes pendientes</p>
        ) : (
          <div className="space-y-2">
            {registrationRequests.map((address, index) => (
              <div key={index} className="border p-3 rounded flex items-center justify-between">
                <span className="font-mono">{address}</span>
                <button
                  onClick={() => handleAuthorize(address)}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  {loading ? 'Autorizando...' : 'Autorizar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 mt-4">
          {error}
        </div>
      )}
    </div>
  );
}; 