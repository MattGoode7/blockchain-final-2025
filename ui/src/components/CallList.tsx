import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ProposalRegistration } from './ProposalRegistration';
import { ProposalVerification } from './ProposalVerification';
import { MetaMaskProposalRegistration } from './MetaMaskProposalRegistration';
import { useMetamask } from '../hooks/useMetaMask';
import { useENSResolution } from '../hooks/useENSResolution';

interface Call {
  callId: string;
  closingTime: string | null;
  creator: string;
  ensName?: string;
  description?: string;
}

interface CallListProps {
  onSelectCall?: (callId: string) => void;
}

export const CallList: React.FC<CallListProps> = ({ onSelectCall }) => {
  const { address: userAddress } = useMetamask();
  const { resolveAddresses, getDisplayName, loading: ensLoading } = useENSResolution();
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
      
      // Obtener el conteo real de propuestas
      if (data.length > 0) {
        const callIds = data.map(call => call.callId);
        const counts = await apiService.getProposalCounts(callIds);
        setProposalCounts(counts);
      }

      // Resolver nombres ENS de los creadores
      if (data.length > 0) {
        const creatorAddresses = [...new Set(data.map(call => call.creator))];
        await resolveAddresses(creatorAddresses);
      }
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
      className={`w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div className="flex items-center">
          <h5 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            Llamados
            <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base font-semibold">
              {filteredCalls.length}
            </span>
          </h5>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleFilterToggle}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow text-sm"
          >
            {showOnlyMyCalls ? 'Ver Todos' : 'Mis Llamados'}
          </button>
          <button
            type="button"
            onClick={loadCalls}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 text-sm"
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
          <p className="text-gray-500 text-center py-8">No hay llamados disponibles</p>
        ) : (
                      <div className="flex flex-col gap-6 sm:gap-8">
              {filteredCalls.map((call) => {
              const creatorDisplayName = getDisplayName(call.creator);
              const showCreatorAddress = !creatorDisplayName || creatorDisplayName === `${call.creator.slice(0, 6)}...${call.creator.slice(-4)}`;
              
              return (
                <div key={call.callId} className="mb-0">
                  <button
                    className={`w-full flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl shadow-md py-4 px-6 bg-blue-600 text-white font-semibold text-base sm:text-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${openCallId === call.callId ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ border: 'none' }}
                    onClick={() => {
                      setOpenCallId(openCallId === call.callId ? null : call.callId);
                      if (onSelectCall) onSelectCall(call.callId);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 w-full">
                      <span className="font-mono text-sm sm:text-base lg:text-lg break-all">
                        {call.ensName ? (
                          <span className="font-sans">{call.ensName}</span>
                        ) : (
                          `ID: ${call.callId.slice(0, 10)}...`
                        )}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="bg-white text-blue-600 font-bold text-xs px-2 py-1 rounded-full shadow whitespace-nowrap">
                          {proposalCounts[call.callId] ?? '-'} propuestas
                        </span>
                        <span className="text-xs sm:text-sm font-normal">Cierre: {formatDate(call.closingTime || '')}</span>
                      </div>
                    </div>
                  </button>
                  {openCallId === call.callId && (
                    <div className="mt-4 p-4 sm:p-6 rounded-xl border border-gray-600">
                      <div className="mb-4 text-xs text-white">
                        <div className="mb-2">
                          Creador: {ensLoading ? (
                            <span className="animate-pulse">Cargando...</span>
                          ) : (
                            <>
                              {creatorDisplayName}
                              {!showCreatorAddress && (
                                <span className="text-white ml-2">
                                  ({call.creator.slice(0, 6)}...{call.creator.slice(-4)})
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {call.description && (
                          <div className="mt-2 text-xs text-gray-300">
                            Descripción: {call.description}
                          </div>
                        )}
                        {!call.description && (
                          <div className="mt-2 text-xs text-gray-400">
                            Descripción: No disponible
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-6 w-full">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 p-6 hover:shadow-xl transition-shadow duration-300">
                            <ProposalRegistration callId={call.callId} />
                          </div>
                          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 p-6 hover:shadow-xl transition-shadow duration-300">
                            <MetaMaskProposalRegistration callId={call.callId} />
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 p-6 hover:shadow-xl transition-shadow duration-300">
                          <ProposalVerification callId={call.callId} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 