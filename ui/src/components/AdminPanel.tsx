import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';

interface RegistrationRequest {
  address: string;
  timestamp: number;
}

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let requests = await ethereumService.getRegistrationRequests();
      // Si la respuesta es null/undefined, forzar array vacío
      if (!Array.isArray(requests)) {
        requests = [];
      }
      // Si es un array de strings, mapear a objetos con timestamp 0
      if (Array.isArray(requests) && requests.every(item => typeof item === 'string')) {
        requests = (requests as string[]).map((address) => ({ address, timestamp: 0 }));
      }
      setRequests(requests);
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

  const formatDate = (timestamp: any) => {
    if (typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0) {
      const date = new Date(timestamp * 1000);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
    return 'Fecha inválida';
  };

  if (loading) {
    return <div className="spinner-border" role="status" />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Panel de Administración</h5>
      </div>
      <div className="card-body">
        <h6>Solicitudes de Registro</h6>
        {requests.length === 0 ? (
          <p className="text-muted">No hay solicitudes pendientes</p>
        ) : (
          <div className="list-group">
            {requests.map((request) => (
              <div key={request.address} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div>{request.address}</div>
                  <small className="text-muted">
                    {formatDate(request.timestamp)}
                  </small>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAuthorize(request.address)}
                >
                  Autorizar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 