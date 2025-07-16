import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ProposalRegistration } from './ProposalRegistration';
import { ProposalVerification } from './ProposalVerification';
import { MetaMaskProposalRegistration } from './MetaMaskProposalRegistration';
import { useMetamask } from '../hooks/useMetaMask';

interface Call {
  callId: string;
  closingTime: string | null;
  creator: string;
}

interface CallListProps {
  onSelectCall?: (callId: string) => void;
}

export const CallList: React.FC<CallListProps> = ({ onSelectCall }) => {
  const { address: userAddress } = useMetamask();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCallId, setOpenCallId] = useState<string | null>(null);
  const [proposalCounts, setProposalCounts] = useState<{ [callId: string]: number }>({});
  const [showOnlyMyCalls, setShowOnlyMyCalls] = useState(false);

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCalls();
      setCalls(data);
      // Contar los llamados
      const counts: { [callId: string]: number } = {};
      data.forEach((call: Call) => {
        counts[call.callId] = 1;
      });
      setProposalCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los llamados');
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const filteredCalls = React.useMemo(() => {
    if (!showOnlyMyCalls || !userAddress) {
      return calls;
    }
    return calls.filter(call => 
      call.creator.toLowerCase() === userAddress.toLowerCase()
    );
  }, [calls, showOnlyMyCalls, userAddress]);

  const handleFilterToggle = () => {
    if (!userAddress) {
      alert('Por favor, conecte su wallet para filtrar sus llamados');
      return;
    }
    setShowOnlyMyCalls(!showOnlyMyCalls);
    setOpenCallId(null); // Cerramos cualquier llamado abierto al cambiar el filtro
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return 'Fecha no disponible';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">
            Error: {error}
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={loadCalls}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card w-full p-8 rounded-2xl shadow-xl bg-white border border-slate-200 transition-all duration-300`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h5 className="text-2xl font-bold flex items-center gap-3">
            Llamados
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-base font-semibold">
              {filteredCalls.length}
            </span>
          </h5>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleFilterToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            {showOnlyMyCalls ? 'Ver Todos' : 'Mis Llamados'}
          </button>
          <button
            type="button"
            onClick={loadCalls}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582M20 20v-5h-.581M5 9A7 7 0 0112 5a7 7 0 017 7c0 1.657-.672 3.157-1.757 4.243M19 15a7 7 0 01-7 4 7 7 0 01-7-7c0-1.657.672-3.157 1.757-4.243" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>
      <div className="card-body px-0 pt-0 pb-0">
        {filteredCalls.length === 0 ? (
          <p className="text-muted text-center py-8">No hay llamados disponibles</p>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredCalls.map((call) => (
              <div key={call.callId} className="mb-0">
                <button
                  className={`w-full flex flex-wrap md:flex-nowrap items-center justify-between rounded-xl shadow-md py-5 px-7 bg-primary text-white font-semibold text-lg transition-all hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary ${openCallId === call.callId ? 'ring-2 ring-primary' : ''}`}
                  style={{ border: 'none' }}
                  onClick={() => {
                    setOpenCallId(openCallId === call.callId ? null : call.callId);
                    if (onSelectCall) onSelectCall(call.callId);
                  }}
                >
                  <span className="font-mono text-base md:text-lg">ID: {call.callId.slice(0, 10)}...</span>
                  <span className="badge bg-white text-primary font-bold text-xs ml-2 px-3 py-1 rounded-full shadow" style={{ minWidth: 60 }}>
                    {proposalCounts[call.callId] ?? '-'} propuestas
                  </span>
                  <span className="text-sm font-normal ml-4">Cierre: {formatDate(call.closingTime || '')}</span>
                </button>
                {openCallId === call.callId && (
                  <div className="mt-6 p-7 bg-slate-100 rounded-2xl border border-slate-300">
                    <div className="mb-4 text-xs text-slate-600">Creador: {call.creator}</div>
                    <div className="flex flex-col gap-6 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="flex flex-col items-center w-full">
                          <ProposalRegistration callId={call.callId} />
                        </div>
                        <div className="flex flex-col items-center w-full">
                          <MetaMaskProposalRegistration callId={call.callId} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <ProposalVerification callId={call.callId} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 