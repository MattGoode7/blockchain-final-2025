import { HttpService } from './httpService';
import { API_ENDPOINTS } from '../config/api';

export interface Call {
  callId: string;
  closingTime: string | null;
  creator: string;
  cfp?: string;
  ensName?: string;
  description?: string;
}

export interface ProposalData {
  sender: string;
  blockNumber: number;
  timestamp: string;
}

export interface SignedProposalData extends ProposalData {
  signer: string;
  signature: string;
}

export interface CreateCallRequest {
  callId: string;
  closingTime: string;
  signature: string;
}

export interface CreateCallWithENSRequest {
  callId: string;
  closingTime: string;
  signature: string;
  callName: string;
  description?: string;
}

export class CallService {
  /**
   * Obtiene el estado de salud del backend
   */
  static async getHealth() {
    return HttpService.get(API_ENDPOINTS.HEALTH);
  }

  /**
   * Obtiene todas las llamadas
   */
  static async getCalls(): Promise<Call[]> {
    return HttpService.get<Call[]>(API_ENDPOINTS.CALLS);
  }

  /**
   * Obtiene una llamada específica
   */
  static async getCall(callId: string): Promise<Call> {
    return HttpService.get<Call>(`${API_ENDPOINTS.CALLS}/${callId}`);
  }

  /**
   * Registra una propuesta
   */
  static async registerProposal(callId: string, proposal: string) {
    return HttpService.post(API_ENDPOINTS.REGISTER_PROPOSAL, {
      callId,
      proposal,
    });
  }

  /**
   * Registra una propuesta con firma
   */
  static async registerProposalWithSignature(
    callId: string, 
    proposal: string, 
    signature: string, 
    signer: string
  ) {
    return HttpService.post(API_ENDPOINTS.REGISTER_PROPOSAL_WITH_SIGNATURE, {
      callId,
      proposal,
      signature,
      signer,
    });
  }

  /**
   * Obtiene datos de una propuesta
   */
  static async getProposalData(callId: string, proposal: string): Promise<ProposalData> {
    return HttpService.get<ProposalData>(
      `${API_ENDPOINTS.PROPOSAL_DATA}/${callId}/${proposal}`
    );
  }

  /**
   * Verifica una propuesta con firma
   */
  static async verifyProposalWithSignature(callId: string, proposal: string) {
    return HttpService.get<{
      isValid: boolean;
      signer?: string;
      message?: string;
    }>(`${API_ENDPOINTS.VERIFY_PROPOSAL}/${callId}/${proposal}`);
  }

  /**
   * Obtiene el tiempo de cierre de una llamada
   */
  static async getClosingTime(callId: string) {
    return HttpService.get(`${API_ENDPOINTS.CLOSING_TIME}/${callId}`);
  }

  /**
   * Crea una nueva llamada
   */
  static async createCall(request: CreateCallRequest) {
    return HttpService.post(API_ENDPOINTS.CREATE_CALL, request);
  }

  /**
   * Crea una nueva llamada con registro ENS
   */
  static async createCallWithENS(request: CreateCallWithENSRequest) {
    return HttpService.post(`${API_ENDPOINTS.CREATE_CALL}-with-ens`, request);
  }

  /**
   * Obtiene los conteos de propuestas para múltiples llamadas
   */
  static async getProposalCounts(callIdsParam: string) {
    return HttpService.get<{ [callId: string]: number }>(
      `${API_ENDPOINTS.PROPOSAL_COUNTS}?callIds=${callIdsParam}`
    );
  }
} 