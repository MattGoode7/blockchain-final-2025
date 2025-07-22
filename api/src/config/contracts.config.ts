import { registerAs } from '@nestjs/config';

export interface ContractsConfig {
  cfpFactoryAddress: string;
  ensRegistryAddress: string;
  publicResolverAddress: string;
  reverseRegistrarAddress: string;
  llamadosRegistrarAddress: string;
  usuariosRegistrarAddress: string;
}

export const contractsConfig = registerAs('contracts', (): ContractsConfig => ({
  cfpFactoryAddress: process.env.CFP_FACTORY_ADDRESS || '',
  ensRegistryAddress: process.env.ENS_REGISTRY_ADDRESS || '',
  publicResolverAddress: process.env.PUBLIC_RESOLVER_ADDRESS || '',
  reverseRegistrarAddress: process.env.REVERSE_REGISTRAR_ADDRESS || '',
  llamadosRegistrarAddress: process.env.LLAMADOS_REGISTRAR_ADDRESS || '',
  usuariosRegistrarAddress: process.env.USUARIOS_REGISTRAR_ADDRESS || '',
})); 