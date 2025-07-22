import { HttpService } from './httpService';
import { API_ENDPOINTS } from '../config/api';

export interface CFPInfo {
  cfp: string;
  callId: string;
  address: string;
  methods: string[];
}

export class CFPApiService {
  /**
   * Obtiene información de un CFP específico
   */
  static async getCfpInfo(callId: string): Promise<CFPInfo> {
    return HttpService.get<CFPInfo>(`${API_ENDPOINTS.CONTRACT_ADDRESS}/cfp/${callId}`);
  }
} 