import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';

export const ENSResolver: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'address'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ensService, setEnsService] = useState<any>(null);

  useEffect(() => {
    const initializeENSService = async () => {
      const service = ethereumService.getENSService();
      if (service) {
        setEnsService(service);
      }
    };

    initializeENSService();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim() || !ensService) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      if (searchType === 'name') {
        // Buscar información completa del nombre
        const nameInfo = await ensService.getNameInfo(searchTerm);
        if (nameInfo) {
          setResult({
            type: 'name',
            data: nameInfo
          });
        } else {
          // Intentar resolver solo la dirección
          const address = await ensService.resolveName(searchTerm);
          if (address) {
            setResult({
              type: 'name',
              data: {
                name: searchTerm,
                address,
                description: 'Información limitada disponible'
              }
            });
          } else {
            setResult({
              type: 'error',
              message: 'Nombre no encontrado'
            });
          }
        }
      } else {
        // Buscar nombre por dirección
        const name = await ensService.resolveAddress(searchTerm);
        if (name) {
          setResult({
            type: 'address',
            data: {
              address: searchTerm,
              name
            }
          });
        } else {
          setResult({
            type: 'error',
            message: 'Dirección no encontrada'
          });
        }
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      setResult({
        type: 'error',
        message: `Error al buscar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.type === 'error') {
      return (
        <div className="mt-4 p-4 bg-red-900/50 text-red-300 border border-red-600 rounded-lg text-sm">
          {result.message}
        </div>
      );
    }

    if (result.type === 'name') {
      const { name, address, description, reverseName } = result.data;
      return (
        <div className="mt-4 p-4 bg-green-900/50 text-green-300 border border-green-600 rounded-lg text-sm">
          <h3 className="font-semibold mb-2 text-white">Información del Nombre</h3>
          <div className="space-y-2">
            <p><strong>Nombre:</strong> {name}</p>
            <p><strong>Dirección:</strong> <span className="font-mono text-sm">{address}</span></p>
            {description && <p><strong>Descripción:</strong> {description}</p>}
            {reverseName && <p><strong>Nombre Reverso:</strong> {reverseName}</p>}
          </div>
        </div>
      );
    }

    if (result.type === 'address') {
      const { address, name } = result.data;
      return (
        <div className="mt-4 p-4 bg-blue-900/50 text-blue-300 border border-blue-600 rounded-lg text-sm">
          <h3 className="font-semibold mb-2 text-white">Información de la Dirección</h3>
          <div className="space-y-2">
            <p><strong>Dirección:</strong> <span className="font-mono text-sm">{address}</span></p>
            <p><strong>Nombre:</strong> {name}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Resolver ENS</h2>
      
      <form onSubmit={handleSearch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tipo de Búsqueda
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center text-white">
              <input
                type="radio"
                value="name"
                checked={searchType === 'name'}
                onChange={(e) => setSearchType(e.target.value as 'name' | 'address')}
                className="mr-2 text-blue-600"
              />
              Buscar por Nombre
            </label>
            <label className="flex items-center text-white">
              <input
                type="radio"
                value="address"
                checked={searchType === 'address'}
                onChange={(e) => setSearchType(e.target.value as 'name' | 'address')}
                className="mr-2 text-blue-600"
              />
              Buscar por Dirección
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-white mb-2">
            {searchType === 'name' ? 'Nombre ENS' : 'Dirección'}
          </label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
            placeholder={searchType === 'name' ? 'ejemplo.usuarios.cfp' : '0x1234...'}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {renderResult()}
    </div>
  );
}; 