import React from 'react';
import { useMetamask } from '../hooks/useMetaMask';

function shortenAddress(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export const MetaMaskConnect: React.FC = () => {
  const { isConnected, address, isNetworkOk, isOwner, isAuthorized, error, connect, disconnect } = useMetamask();

  if (!window.ethereum) {
    return (
      <div className="alert alert-warning">
        Por favor instala MetaMask para usar esta aplicación
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error: {error}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button 
        className="btn btn-primary px-3 py-1 text-sm rounded"
        onClick={connect}
      >
        Conectar con MetaMask
      </button>
    );
  }

  if (!isNetworkOk) {
    return (
      <div className="alert alert-warning">
        Por favor conéctate a la red correcta
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-[#1e293b] px-2 py-1 rounded-lg border border-border">
      <span className="text-xs text-white font-mono">{shortenAddress(address || '')}</span>
      {isOwner && (
        <span className="badge badge-success text-xs ml-1">Admin</span>
      )}
      {!isOwner && isAuthorized && (
        <span className="badge text-xs ml-1" style={{ backgroundColor: '#2563eb', color: 'white' }}>Autorizado</span>
      )}
      <button 
        className="ml-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        onClick={disconnect}
      >
        Desconectar
      </button>
    </div>
  );
}; 