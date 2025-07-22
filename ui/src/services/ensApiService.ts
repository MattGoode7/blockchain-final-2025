import { HttpService } from './httpService';
import { API_ENDPOINTS } from '../config/api';

export interface ENSNameInfo {
  name: string;
  address: string;
  description?: string;
  reverseName?: string;
}

export interface RegisterUserNameRequest {
  userName: string;
  userAddress: string;
  description?: string;
}

export interface RegisterCallNameRequest {
  callName: string;
  callAddress: string;
  description?: string;
}

export interface ENSResponse {
  success: boolean;
  message?: string;
  transactionHash?: string;
  blockNumber?: number;
}

export interface ResolveNameResponse {
  success: boolean;
  name?: string;
  address?: string;
  message?: string;
}

export interface NameInfoResponse {
  success: boolean;
  nameInfo?: ENSNameInfo;
  message?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  name: string;
  isAvailable: boolean;
}

export interface RegisteredNamesResponse {
  success: boolean;
  domain: string;
  names: string[];
}

export interface ResolveAddressesResponse {
  success: boolean;
  results: { [address: string]: string | null };
}

export class ENSApiService {
  /**
   * Registra un nombre de usuario en el backend
   */
  static async registerUserName(request: RegisterUserNameRequest): Promise<ENSResponse> {
    return HttpService.post<ENSResponse>(API_ENDPOINTS.ENS_REGISTER_USER, request);
  }

  /**
   * Registra un nombre de llamado en el backend
   */
  static async registerCallName(request: RegisterCallNameRequest): Promise<ENSResponse> {
    return HttpService.post<ENSResponse>(API_ENDPOINTS.ENS_REGISTER_CALL, request);
  }

  /**
   * Resuelve una dirección a partir de un nombre ENS
   */
  static async resolveName(name: string): Promise<ResolveNameResponse> {
    return HttpService.get<ResolveNameResponse>(`${API_ENDPOINTS.ENS_RESOLVE_NAME}/${encodeURIComponent(name)}`);
  }

  /**
   * Resuelve un nombre a partir de una dirección (resolución reversa)
   */
  static async resolveAddress(address: string): Promise<ResolveNameResponse> {
    return HttpService.get<ResolveNameResponse>(`${API_ENDPOINTS.ENS_RESOLVE_ADDRESS}/${address}`);
  }

  /**
   * Resuelve múltiples direcciones de una vez
   */
  static async resolveAddresses(addresses: string[]): Promise<ResolveAddressesResponse> {
    return HttpService.post<ResolveAddressesResponse>(API_ENDPOINTS.ENS_RESOLVE_ADDRESSES, { addresses });
  }

  /**
   * Obtiene información completa de un nombre ENS
   */
  static async getNameInfo(name: string): Promise<NameInfoResponse> {
    return HttpService.get<NameInfoResponse>(`${API_ENDPOINTS.ENS_NAME_INFO}/${encodeURIComponent(name)}`);
  }

  /**
   * Verifica si un nombre está disponible
   */
  static async checkNameAvailability(name: string): Promise<AvailabilityResponse> {
    return HttpService.get<AvailabilityResponse>(`${API_ENDPOINTS.ENS_CHECK_AVAILABILITY}/${encodeURIComponent(name)}`);
  }

  /**
   * Obtiene todos los nombres registrados en un dominio
   */
  static async getRegisteredNames(domain: 'usuarios.cfp' | 'llamados.cfp'): Promise<RegisteredNamesResponse> {
    return HttpService.get<RegisteredNamesResponse>(`${API_ENDPOINTS.ENS_REGISTERED_NAMES}?domain=${domain}`);
  }
} 