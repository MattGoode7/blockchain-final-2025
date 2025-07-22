import { useState, useCallback } from 'react';
import { ENSApiService } from '../services/ensApiService';

interface ENSResolutionCache {
  [address: string]: string | null;
}

export const useENSResolution = () => {
  const [cache, setCache] = useState<ENSResolutionCache>({});
  const [loading, setLoading] = useState(false);

  const resolveAddress = useCallback(async (address: string): Promise<string | null> => {
    // Si ya está en cache, devolver el resultado
    if (cache[address] !== undefined) {
      return cache[address];
    }

    try {
      setLoading(true);
      const response = await ENSApiService.resolveAddress(address);
      
      const name = response.success ? response.name : null;
      
      // Guardar en cache
      setCache(prev => ({
        ...prev,
        [address]: name || null
      }));

      return name || null;
    } catch (error) {
      console.error('Error resolviendo dirección:', error);
      // Guardar null en cache para evitar reintentos
      setCache(prev => ({
        ...prev,
        [address]: null
      }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const resolveAddresses = useCallback(async (addresses: string[]): Promise<{ [address: string]: string | null }> => {
    // Filtrar direcciones que ya están en cache
    const uncachedAddresses = addresses.filter(addr => cache[addr] === undefined);
    
    if (uncachedAddresses.length === 0) {
      // Todas las direcciones están en cache
      return addresses.reduce((acc, addr) => {
        acc[addr] = cache[addr];
        return acc;
      }, {} as { [address: string]: string | null });
    }

    try {
      setLoading(true);
      const response = await ENSApiService.resolveAddresses(uncachedAddresses);
      
      if (response.success) {
        // Actualizar cache con los nuevos resultados
        setCache(prev => ({
          ...prev,
          ...response.results
        }));

        // Combinar resultados del cache con los nuevos
        return addresses.reduce((acc, addr) => {
          acc[addr] = cache[addr] !== undefined ? cache[addr] : response.results[addr];
          return acc;
        }, {} as { [address: string]: string | null });
      }

      return {};
    } catch (error) {
      console.error('Error resolviendo direcciones:', error);
      return {};
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const getDisplayName = useCallback((address: string): string => {
    const name = cache[address];
    if (name) {
      return name;
    }
    // Si no hay nombre ENS, mostrar dirección acortada
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    resolveAddress,
    resolveAddresses,
    getDisplayName,
    clearCache,
    loading,
    cache
  };
}; 