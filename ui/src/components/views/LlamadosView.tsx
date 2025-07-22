import React, { useState, useEffect } from 'react';
import { DocumentMagnifyingGlassIcon, UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CallList } from '../CallList';
import { UserRegistration } from '../UserRegistration';
import { CreateCFPWithENS } from '../CreateCFPWithENS';
import { useMetamask } from '../../hooks/useMetaMask';
import { ethereumService } from '../../services/ethereumService';

interface LlamadosViewProps {
  onCallCreated: (callId: string) => void;
}

interface SuccessNotification {
  callId: string;
  callAddress?: string;
  callName?: string;
}

export const LlamadosView: React.FC<LlamadosViewProps> = ({ onCallCreated }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successNotification, setSuccessNotification] = useState<SuccessNotification | null>(null);
  const { isConnected, isOwner, isNetworkOk, address } = useMetamask();

  useEffect(() => {
    const checkAuth = async () => {
      if (isConnected && address) {
        try {
          const authorized = await ethereumService.isAuthorized(address);
          setIsAuthorized(authorized);
        } catch {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, [isConnected, address]);

  const handleCallCreated = (callId: string, callAddress?: string, callName?: string) => {
    onCallCreated(callId);
    setShowModal(false);
    setSuccessNotification({ callId, callAddress, callName });
    
    // Auto-hide notification after 8 seconds
    setTimeout(() => {
      setSuccessNotification(null);
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {successNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">✅ Llamado creado exitosamente</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><span className="font-semibold">ID:</span> <span className="font-mono break-all">{successNotification.callId}</span></p>
                  {successNotification.callAddress && (
                    <p className="mt-1"><span className="font-semibold">Dirección:</span> <span className="font-mono break-all">{successNotification.callAddress}</span></p>
                  )}
                  {successNotification.callName && (
                    <p className="mt-1"><span className="font-semibold">Nombre ENS:</span> <span className="font-mono break-all">{successNotification.callName}.llamados.cfp</span></p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setSuccessNotification(null)}
                  className="text-green-400 hover:text-green-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 opacity-100">
            Gestión de Propuestas Blockchain
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-light text-white">
            Registra y verifica propuestas de manera segura y transparente. Selecciona un llamado vigente para comenzar el proceso.
          </p>
        </div>
        {isConnected && isNetworkOk && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo CFP</span>
          </button>
        )}
      </div>

      {!(isConnected && isNetworkOk) ? (
        <section className="w-full">
          <div className="section-header flex items-center text-center space-x-2 mb-4 text-white">
            <DocumentMagnifyingGlassIcon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold opacity-100 text-white">
              Llamados Disponibles
            </h2>
          </div>
          <CallList onSelectCall={() => {}} />
        </section>
      ) : (
        <div className={(!isAuthorized || isOwner) ? "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" : "w-full"}>
          <div className={(!isAuthorized || isOwner) ? "lg:col-span-2" : "w-full"}>
            <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-4 sm:p-6 rounded-2xl">
              <div className="section-header flex items-center space-x-2 mb-4">
                <DocumentMagnifyingGlassIcon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold card-title opacity-100">
                  Llamados Disponibles
                </h2>
              </div>
              <CallList onSelectCall={() => {}} />
            </section>
          </div>
          {(!isAuthorized || isOwner) && (
            <div className="flex flex-col gap-6 lg:gap-8 h-full">
              <section className="section card shadow-2xl bg-[#f8fafc]/90 border-2 border-[#334155] p-4 sm:p-6 rounded-2xl">
                <div className="section-header flex items-center space-x-2 mb-4">
                  <UserCircleIcon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold card-title opacity-100">
                    Registro de Usuario
                  </h2>
                </div>
                <UserRegistration isOwner={isOwner} isAuthorized={isAuthorized} />
              </section>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear CFP con ENS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-white">Crear Nuevo CFP con ENS</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CreateCFPWithENS onCallCreated={handleCallCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 