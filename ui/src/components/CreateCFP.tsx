import React, { useState } from 'react';
import { ethereumService } from '../services/ethereumService';
import { apiService } from '../services/api';
import { ethers } from 'ethers';
import { useMetamask } from '../hooks/useMetaMask';

interface CreateCFPProps {
  onCallCreated: (callId: string) => void;
}

export const CreateCFP: React.FC<CreateCFPProps> = ({ onCallCreated }) => {
  const { isConnected, isNetworkOk } = useMetamask();
  const [closingDate, setClosingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingDate.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Verificar si la cuenta está autorizada
      const currentAddress = ethereumService.getCurrentAddress();
      if (!currentAddress) {
        throw new Error('No hay una cuenta conectada');
      }

      const isAuthorized = await ethereumService.isAuthorized(currentAddress);
      if (!isAuthorized) {
        throw new Error('Tu cuenta no está autorizada para crear llamados. Por favor, regístrate primero.');
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

      if (isConnected && isNetworkOk) {
        // Interacción directa con el contrato mediante MetaMask
        await ethereumService.createCFP(generatedCallId, timestamp);
      } else if (isConnected) {
        // Crear llamado vía API (se requiere firma del mensaje)

        // 1. Obtener dirección del contrato Factory desde la API
        const factoryAddress = await apiService.getContractAddress();

        // 2. Construir el mensaje a firmar (address + callId sin 0x)
        const messageHex = '0x' + factoryAddress.toLowerCase().replace(/^0x/, '') + generatedCallId.slice(2);

        // 3. Firmar mensaje con la cuenta conectada
        const signature = await ethereumService.signMessage(ethers.getBytes(messageHex));

        // 4. Convertir fecha de cierre a ISO
        const closingTimeIso = new Date(closingDate).toISOString();

        // 5. Llamar a la API para crear el CFP
        await apiService.createCall(generatedCallId, closingTimeIso, signature);
      } else {
        throw new Error('Para crear un llamado es necesario conectar MetaMask');
      }

      setSuccess(true);
      setCallId(generatedCallId);
      onCallCreated(generatedCallId);
      setClosingDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el llamado');
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima para el input (ahora, en formato local para datetime-local)
  const minDate = new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="card shadow-xl p-6 rounded-2xl bg-white border border-slate-200">
      <div className="card-header mb-4">
        <h5 className="card-title text-xl font-bold mb-0">Crear Llamado</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="closingDate" className="font-semibold text-base text-slate-700 mb-1">
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

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Creando...
              </>
            ) : (
              'Crear Llamado'
            )}
          </button>
        </form>

        {success && callId && (
          <div className="alert alert-success mt-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 break-words" style={{ wordBreak: 'break-all', maxWidth: '100%' }}>
            <div className="font-semibold mb-1">Llamado creado correctamente.</div>
            <div className="text-sm"><span className="font-semibold">ID:</span> <span className="font-mono break-all">{callId}</span></div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-4 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}; 