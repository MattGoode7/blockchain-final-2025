import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { calculateSHA256 } from '../utils/hash';
import { useMetamask } from '../hooks/useMetaMask';
import { ethereumService } from '../services/ethereumService';

interface MetaMaskProposalRegistrationProps {
  callId: string;
}

export function MetaMaskProposalRegistration({ callId }: MetaMaskProposalRegistrationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { address, isConnected } = useMetamask();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !isConnected || !address) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const hash = await calculateSHA256(file);

      // Firmar el hash con MetaMask
      const signature = await ethereumService.signMessage(hash);
      
      // Registrar la propuesta con la firma
      await apiService.registerProposalWithSignature(callId, hash, signature, address);
      
      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('La propuesta ya ha sido registrada o la convocatoria está cerrada.');
        } else if (err.response.status === 404) {
          setError('El llamado no existe.');
        } else if (err.response.status === 400) {
          setError('Datos inválidos o la convocatoria está cerrada.');
        } else {
          setError('Error al registrar la propuesta.');
        }
      } else {
        setError('Error al registrar la propuesta.');
      }
      setSuccess(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-2">
          <ArrowUpTrayIcon className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-bold bg-clip-text text-black drop-shadow-md opacity-100">
            Registrar Propuesta con MetaMask
          </h3>
        </div>
        <p className="text-text-light text-sm mb-4">
          Conecta tu wallet de MetaMask para registrar propuestas de forma segura y verificable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-2">
        <ArrowUpTrayIcon className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-bold bg-clip-text text-black drop-shadow-md opacity-100">
          Registrar con MetaMask
        </h3>
      </div>
      <p className="text-text-light text-sm mb-4">
        Sube tu propuesta para registrarla en el sistema con tu wallet de MetaMask. 
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">Seleccionar archivo</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="p-4 text-green-500 bg-green-50 rounded-lg">
            Propuesta registrada exitosamente con tu wallet de MetaMask
          </div>
        )}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : 'Registrar Propuesta con MetaMask'}
        </button>
      </form>
    </div>
  );
} 