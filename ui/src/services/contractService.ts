import { HttpService } from './httpService';
import { API_ENDPOINTS } from '../config/api';

export interface ContractAddresses {
  cfpFactoryAddress: string;
  ensRegistryAddress: string;
  publicResolverAddress: string;
  reverseRegistrarAddress: string;
  llamadosRegistrarAddress: string;
  usuariosRegistrarAddress: string;
}

export class ContractService {
  /**
   * Obtiene todas las direcciones de contratos desde el backend
   */
  static async getContractAddresses(): Promise<ContractAddresses> {
    return HttpService.get<ContractAddresses>(API_ENDPOINTS.CONTRACT_ADDRESS);
  }

  /**
   * Obtiene información del factory
   */
  static async getFactoryInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/factory`);
  }

  /**
   * Obtiene información del registro ENS
   */
  static async getENSRegistryInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/ens-registry`);
  }

  /**
   * Obtiene información del resolver público
   */
  static async getPublicResolverInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/public-resolver`);
  }

  /**
   * Obtiene información del registrador reverso
   */
  static async getReverseRegistrarInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/reverse-registrar`);
  }

  /**
   * Obtiene información del registrador de llamados
   */
  static async getLlamadosRegistrarInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/llamados-registrar`);
  }

  /**
   * Obtiene información del registrador de usuarios
   */
  static async getUsuariosRegistrarInfo() {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/usuarios-registrar`);
  }

  /**
   * Obtiene información de un CFP específico
   */
  static async getCfpInfo(callId: string) {
    return HttpService.get(`${API_ENDPOINTS.CONTRACT_ADDRESS}/cfp/${callId}`);
  }
} 