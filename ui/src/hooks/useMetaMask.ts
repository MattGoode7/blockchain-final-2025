import { useState, useEffect, useCallback } from 'react';
import { ethereumService } from '../services/ethereumService';

export interface MetaMaskState {
  isConnected: boolean;
  address: string | null;
  isNetworkOk: boolean;
  isOwner: boolean;
  isAuthorized: boolean;
  error: string | null;
}

export function useMetamask() {
  const [state, setState] = useState<MetaMaskState>({
    isConnected: false,
    address: null,
    isNetworkOk: false,
    isOwner: false,
    isAuthorized: false,
    error: null
  });

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await ethereumService.connect();
      
      const signer = ethereumService.signer;
      if (!signer) throw new Error('No se pudo obtener el signer');

      const address = await signer.getAddress();
      const [ownerAddress, isAuthorized] = await Promise.all([
        ethereumService.factoryService?.contract.owner(),
        ethereumService.isAuthorized(address)
      ]);
      const isOwner = Boolean(ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase());

      setState({
        isConnected: true,
        address,
        isNetworkOk: true,
        isOwner,
        isAuthorized: isOwner || isAuthorized,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    ethereumService.disconnect();
    setState({
      isConnected: false,
      address: null,
      isNetworkOk: false,
      isOwner: false,
      isAuthorized: false,
      error: null
    });
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await ethereumService.checkConnection();
      if (!isConnected) {
        setState(prev => ({ ...prev, isConnected: false }));
        return;
      }

      const signer = ethereumService.signer;
      if (!signer) return;

      const address = await signer.getAddress();
      const [ownerAddress, isAuthorized] = await Promise.all([
        ethereumService.factoryService?.contract.owner(),
        ethereumService.isAuthorized(address)
      ]);
      const isOwner = Boolean(ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase());

      setState({
        isConnected: true,
        address,
        isNetworkOk: true,
        isOwner,
        isAuthorized: isOwner || isAuthorized,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    connect,
    disconnect,
    checkConnection
  };
} 