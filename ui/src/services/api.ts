import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Call {
  callId: string;
  closingTime: string | null;
  creator: string;
  cfp?: string;
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

export const apiService = {
  async getHealth() {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },

  async getCall(callId: string) {
    const response = await api.get<Call>(`${API_ENDPOINTS.CALLS}/${callId}`);
    return response.data;
  },

  async registerProposal(callId: string, proposal: string) {
    const response = await api.post(API_ENDPOINTS.REGISTER_PROPOSAL, {
      callId,
      proposal,
    });
    return response.data;
  },

  async registerProposalWithSignature(callId: string, proposal: string, signature: string, signer: string) {
    const response = await api.post(API_ENDPOINTS.REGISTER_PROPOSAL, {
      callId,
      proposal,
      signature,
      signer,
    });
    return response.data;
  },

  async getProposalData(callId: string, proposal: string) {
    const response = await api.get<ProposalData>(
      `${API_ENDPOINTS.PROPOSAL_DATA}/${callId}/${proposal}`
    );
    return response.data;
  },

  async verifyProposalWithSignature(callId: string, proposal: string) {
    const response = await api.get<{
      isValid: boolean;
      signer?: string;
      message?: string;
    }>(`${API_ENDPOINTS.VERIFY_PROPOSAL}/${callId}/${proposal}`);
    return response.data;
  },

  async getClosingTime(callId: string) {
    const response = await api.get(`${API_ENDPOINTS.CLOSING_TIME}/${callId}`);
    return response.data;
  },

  async getCalls() {
    const response = await api.get<Call[]>(API_ENDPOINTS.CALLS);
    return response.data;
  },

  async getContractAddress() {
    const response = await api.get<{ address: string }>(API_ENDPOINTS.CONTRACT_ADDRESS);
    return response.data.address;
  },

  async createCall(callId: string, closingTimeIso: string, signature: string) {
    const response = await api.post(API_ENDPOINTS.CREATE_CALL, {
      callId,
      closingTime: closingTimeIso,
      signature,
    });
    return response.data;
  },
}; 