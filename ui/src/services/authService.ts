import { HttpService } from './httpService';
import { API_ENDPOINTS } from '../config/api';

export interface RegisterRequest {
  address: string;
  name?: string;
  email?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  transactionHash?: string;
}

export interface AuthorizationResponse {
  success: boolean;
  isAuthorized: boolean;
  message?: string;
}

export class AuthService {
  /**
   * Registra una nueva cuenta
   */
  static async register(request: RegisterRequest): Promise<RegisterResponse> {
    return HttpService.post<RegisterResponse>(API_ENDPOINTS.REGISTER, request);
  }

  /**
   * Verifica si una dirección está autorizada
   */
  static async isAuthorized(address: string): Promise<AuthorizationResponse> {
    return HttpService.get<AuthorizationResponse>(`${API_ENDPOINTS.AUTHORIZED}/${address}`);
  }

  /**
   * Autoriza una cuenta
   */
  static async authorizeAccount(address: string): Promise<AuthorizationResponse> {
    return HttpService.post<AuthorizationResponse>(`${API_ENDPOINTS.AUTHORIZE}/${address}`);
  }
} 