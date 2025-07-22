import React, { useState, useEffect } from 'react';
import { ethereumService } from '../services/ethereumService';
import { apiService } from '../services/api';
import { getBytes } from 'ethers';
import { useMetamask } from '../hooks/useMetaMask';

interface CreateCFPWithENSProps {
  onCallCreated: (callId: string, callAddress?: string, callName?: string) => void;
}

interface CreateCallWithENSResponse {
  cfpAddress: string;
  ensName?: string;
}

export const CreateCFPWithENS: React.FC<CreateCFPWithENSProps> = ({ onCallCreated }) => {
  const { isConnected, isNetworkOk } = useMetamask();
  const [closingDate, setClosingDate] = useState('');
  const [callName, setCallName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (callName && ensService) {
        try {
          const fullName = `${callName}.llamados.cfp`;
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
  }, [callName, ensService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!closingDate.trim()) {
      setError('Por favor selecciona una fecha de cierre');
      return;
    }

    if (!callName.trim()) {
      setError('Por favor ingresa un nombre para el llamado');
      return;
    }

    if (isNameAvailable === false) {
      setError('El nombre del llamado ya está registrado');
      return;
    }

    if (!ensService) {
      setError('Error: Servicio ENS no inicializado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar si la cuenta está conectada
      const currentAddress = ethereumService.getCurrentAddress();
      if (!currentAddress) {
        throw new Error('No hay una cuenta conectada');
      }

      // Generar un callId único usando la hora actual y un número aleatorio
      const randomNumber = Math.floor(Math.random() * 1000000);
      const generatedCallId = ethereumService.generateCallId(
        `call_${Date.now()}`,
        `random_${randomNumber}`
      );

      // Validar el formato del callId
      if (!/^0x[0-9a-fA-F]{64}$/.test(generatedCallId)) {
        throw new Error('Error al generar el ID del llamado');
      }

      // Convertir la fecha seleccionada a timestamp (segundos)
      const timestamp = Math.floor(new Date(closingDate).getTime() / 1000);
      if (isNaN(timestamp) || timestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error('La fecha de cierre debe ser posterior a la actual.');
      }

      let cfpAddress: string | null = null;

      // Paso 1: Crear el llamado
      console.log('Paso 1: Creando el llamado...');
      if (isConnected && isNetworkOk) {
        // Interacción directa con el contrato mediante MetaMask
        const result = await ethereumService.createCFP(generatedCallId, timestamp);
        cfpAddress = result.cfpAddress;
      } else if (isConnected) {
        // Crear llamado vía API (se requiere firma del mensaje)
        const factoryAddress = await apiService.getContractAddress();
        const messageHex = '0x' + factoryAddress.toLowerCase().replace(/^0x/, '') + generatedCallId.slice(2);
        const signature = await ethereumService.signMessage(getBytes(messageHex));
        const closingTimeIso = new Date(closingDate).toISOString();
        
        // Usar el nuevo endpoint que maneja tanto la creación del llamado como el registro ENS
        const response = await apiService.createCallWithENS(generatedCallId, closingTimeIso, signature, callName, description) as CreateCallWithENSResponse;
        cfpAddress = response.cfpAddress;
        
        // Si el backend ya manejó el registro ENS, no necesitamos hacerlo aquí
        console.log('✅ Llamado creado y ENS registrado por el backend');
        
        // Usar el nombre ENS devuelto por el backend o el nombre local
        const finalCallName = response.ensName ? response.ensName.replace('.llamados.cfp', '') : callName;
        
        onCallCreated(generatedCallId, cfpAddress, finalCallName);
        
        // Limpiar formulario
        setClosingDate('');
        setCallName('');
        setDescription('');
        setIsNameAvailable(null);
        
        return; // Salir temprano ya que el backend manejó todo
      } else {
        throw new Error('Para crear un llamado es necesario conectar MetaMask');
      }

      console.log('✅ Llamado creado exitosamente');
      console.log(`Dirección del CFP: ${cfpAddress}`);

      // Paso 2: Registrar el nombre ENS (solo si se usó MetaMask directamente)
      console.log('Paso 2: Registrando nombre ENS...');
      await ensService.registerCallNameWithMetaMask(callName, cfpAddress!, description);
      console.log('✅ Nombre ENS registrado exitosamente');

      onCallCreated(generatedCallId, cfpAddress, callName);
      
      // Limpiar formulario
      setClosingDate('');
      setCallName('');
      setDescription('');
      setIsNameAvailable(null);
      
    } catch (err) {
      console.error('Error durante la creación:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el llamado');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityMessage = () => {
    if (isNameAvailable === null) return null;
    if (isNameAvailable) {
      return <span className="text-green-600 text-sm">✓ Nombre disponible</span>;
    } else {
      return <span className="text-red-600 text-sm">✗ Nombre no disponible</span>;
    }
  };

  // Obtener fecha mínima para el input
  const minDate = new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h5 className="text-xl font-bold mb-0 text-white">Crear Llamado con ENS</h5>
        <p className="text-sm text-white mt-1">
          Crea un llamado y registra su nombre ENS en un solo paso
        </p>
      </div>
      
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Fecha de cierre */}
          <div className="flex flex-col gap-2">
            <label htmlFor="closingDate" className="font-semibold text-base text-white mb-1">
              Fecha y hora de cierre
            </label>
            <input
              type="datetime-local"
              id="closingDate"
              className="border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:outline-none"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              min={minDate}
              required
            />
            <span className="text-xs text-slate-400">No puede ser anterior a la fecha y hora actual.</span>
          </div>

          {/* Nombre del llamado */}
          <div className="flex flex-col gap-2">
            <label htmlFor="callName" className="font-semibold text-base text-white mb-1">
              Nombre del Llamado
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="callName"
                value={callName}
                onChange={(e) => setCallName(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="mi-llamado"
                required
                disabled={loading}
              />
              <span className="text-slate-500 text-sm font-mono">.llamados.cfp</span>
            </div>
            {getAvailabilityMessage()}
            <span className="text-xs text-slate-400">
              Este nombre será usado para identificar el llamado en el sistema ENS
            </span>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-semibold text-base text-white mb-1">
              Descripción del Llamado
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Describe el propósito y detalles del llamado..."
              rows={4}
              disabled={loading}
            />
            <span className="text-xs text-slate-400">
              Esta descripción se guardará como metadato en ENS
            </span>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !closingDate.trim() || !callName.trim() || isNameAvailable === false}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Creando llamado y registrando ENS...
              </>
            ) : (
              'Crear Llamado con ENS'
            )}
          </button>
        </form>

        {/* Mensaje de error */}
        {error && (
          <div className="alert alert-danger mt-4 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}; 