import React from 'react';
import { AdminPanel } from '../AdminPanel';
import { useMetamask } from '../../hooks/useMetaMask';

export const AdminView: React.FC = () => {
  const { isConnected, isOwner, isNetworkOk } = useMetamask();

  if (!isConnected || !isNetworkOk) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 opacity-100">
            Panel de Administración
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-light text-white">
            Conecta tu wallet de administrador para acceder al panel de gestión.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="text-center p-8 bg-gray-800 border border-gray-600 rounded-xl">
            <p className="text-gray-300">Por favor, conecta tu wallet de administrador</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 opacity-100">
            Panel de Administración
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-light text-white">
            Acceso restringido solo para administradores del sistema.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="text-center p-8 bg-gray-800 border border-gray-600 rounded-xl">
            <p className="text-red-400 font-semibold">Acceso denegado</p>
            <p className="text-gray-300 mt-2">Solo los administradores pueden acceder a esta sección</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 opacity-100">
          Panel de Administración
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-text-light text-white">
          Gestiona el sistema de propuestas blockchain desde tu panel de administrador.
        </p>
      </div>

      <div className="flex justify-center">
        <section className="w-full">
          <AdminPanel />
        </section>
      </div>
    </div>
  );
}; 