import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';

interface ENSUserRegistrationProps {
  onRegistrationComplete?: () => void;
}

export const ENSUserRegistration: React.FC<ENSUserRegistrationProps> = ({ onRegistrationComplete }) => {
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
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

  useEffect(() => {
    const checkNameAvailability = async () => {
      if (userName && ensService) {
        try {
          const fullName = `${userName}.usuarios.cfp`;
          const available = await ensService.isNameAvailable(fullName);
          setIsNameAvailable(available);
        } catch (error) {
          console.error('Error al verificar disponibilidad:', error);
          setIsNameAvailable(null);
        }
      } else {
        setIsNameAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkNameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [userName, ensService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ensService) {
      setMessage('Error: Servicio ENS no inicializado');
      return;
    }

    if (!userName.trim()) {
      setMessage('Por favor ingresa un nombre de usuario');
      return;
    }

    if (isNameAvailable === false) {
      setMessage('El nombre de usuario ya está registrado');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const receipt = await ensService.registerUserNameWithMetaMask(userName, description);
      
      setMessage(`¡Nombre registrado exitosamente! Hash: ${receipt.hash}`);
      setUserName('');
      setDescription('');
      setIsNameAvailable(null);
      
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error) {
      console.error('Error al registrar nombre:', error);
      setMessage(`Error al registrar nombre: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityMessage = () => {
    if (isNameAvailable === null) return null;
    if (isNameAvailable) {
      return <span className="text-green-400 text-sm">✓ Nombre disponible</span>;
    } else {
      return <span className="text-red-400 text-sm">✗ Nombre no disponible</span>;
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-600 transition-all duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Registrar Nombre ENS</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-white mb-2">
            Nombre de Usuario
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
              placeholder="mi-nombre"
              disabled={isLoading}
            />
            <span className="text-gray-300 text-sm">.usuarios.cfp</span>
          </div>
          {getAvailabilityMessage()}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
            placeholder="Breve descripción sobre ti..."
            rows={3}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !userName.trim() || isNameAvailable === false}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registrando...' : 'Registrar Nombre'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-lg text-sm ${
          message.includes('Error') ? 'bg-red-900/50 text-red-300 border border-red-600' : 'bg-green-900/50 text-green-300 border border-green-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}; 