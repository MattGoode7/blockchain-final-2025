import { useState } from 'react';
import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { calculateSHA256 } from '../utils/hash';

interface ProposalVerificationProps {
  callId: string;
}

export function ProposalVerification({ callId }: ProposalVerificationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    data?: {
      sender: string;
      blockNumber: number;
      timestamp: string;
    };
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setVerificationResult(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setVerificationResult(null);

      const hash = await calculateSHA256(file);

      const data = await apiService.getProposalData(callId, hash);
      setVerificationResult({
        exists: true,
        data,
      });
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 404) {
          setVerificationResult({ exists: false });
        } else if (err.response.status === 400) {
          setError('Datos inválidos o hash incorrecto.');
        } else {
          setError('Error al verificar la propuesta.');
        }
      } else {
        setError('Error al verificar la propuesta.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <MagnifyingGlassCircleIcon className="h-6 w-6 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Verificar Propuesta</h3>
      </div>
      <p className="text-gray-300 text-sm mb-6 flex-grow">Selecciona el archivo de la propuesta para verificar si ya fue registrada en el sistema.</p>
      <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Seleccionar archivo</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200"
          />
        </div>
        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg text-sm break-words">
            {error}
          </div>
        )}
        {verificationResult && (
          <div className={`p-4 rounded-lg text-sm break-words ${
            verificationResult.exists
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {verificationResult.exists ? (
              <div className="space-y-2">
                <p className="font-semibold">Propuesta encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold">Propuesta no encontrada</p>
                <p className="text-sm">La propuesta no ha sido registrada en el sistema.</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-auto">
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Verificar Propuesta'}
          </button>
        </div>
      </form>
    </div>
  );
} 