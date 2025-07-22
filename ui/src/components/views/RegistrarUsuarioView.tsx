import React from 'react';
import { ENSUserRegistration } from '../ENSUserRegistration';

export const RegistrarUsuarioView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 opacity-100">
          Registrar Usuario ENS
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-text-light text-white">
          Registra tu nombre de usuario en el sistema ENS. Esto te permitirá ser identificado por un nombre legible en lugar de tu dirección de wallet.
        </p>
      </div>

      <div className="flex justify-center">
        <section className="w-full">
          <ENSUserRegistration />
        </section>
      </div>
    </div>
  );
}; 