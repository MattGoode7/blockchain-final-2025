import React, { useEffect } from 'react';
import { useMetamask } from '../hooks/useMetaMask';
import { useENSResolution } from '../hooks/useENSResolution';

function shortenAddress(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export const MetaMaskConnect: React.FC = () => {
  const { isConnected, address, isNetworkOk, isOwner, isAuthorized, error, connect, disconnect } = useMetamask();
  const { resolveAddress, getDisplayName, loading } = useENSResolution();

  useEffect(() => {
    if (address && isConnected) {
      resolveAddress(address);
    }
  }, [address, isConnected, resolveAddress]);

  if (!window.ethereum) {
    return (
      <div className="text-yellow-400 text-sm p-3 bg-yellow-900/20 rounded-lg border border-yellow-600">
        Por favor instala MetaMask para usar esta aplicación
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-600">
        Error: {error}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button 
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
        onClick={connect}
      >
        Conectar con MetaMask
      </button>
    );
  }

  if (!isNetworkOk) {
    return (
      <div className="text-yellow-400 text-sm p-3 bg-yellow-900/20 rounded-lg border border-yellow-600">
        Por favor conéctate a la red correcta
      </div>
    );
  }

  const displayName = address ? getDisplayName(address) : '';
  const showAddress = !displayName || displayName === shortenAddress(address || '');

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-white font-medium truncate">
            {loading ? (
              <span className="animate-pulse">Cargando...</span>
            ) : (
              displayName || shortenAddress(address || '')
            )}
          </span>
          {!showAddress && (
            <span className="text-xs text-gray-400 font-mono">
              {shortenAddress(address || '')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isOwner && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Admin</span>
          )}
          {!isOwner && isAuthorized && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Autorizado</span>
          )}
        </div>
      </div>
      <button 
        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold flex-shrink-0"
        onClick={disconnect}
      >
        Desconectar
      </button>
    </div>
  );
}; 