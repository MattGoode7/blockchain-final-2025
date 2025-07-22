// Este archivo se mantiene por compatibilidad con código existente
// Se recomienda usar CallService y ContractService en su lugar

import { CallService } from './callService';
import { ContractService } from './contractService';

// Re-exportar interfaces para compatibilidad
export type { Call, ProposalData, SignedProposalData } from './callService';
export type { ContractAddresses } from './contractService';

// Mantener la API existente pero delegar a los nuevos servicios
export const apiService = {
  async getHealth() {
    return CallService.getHealth();
  },

  async getCall(callId: string) {
    return CallService.getCall(callId);
  },

  async registerProposal(callId: string, proposal: string) {
    return CallService.registerProposal(callId, proposal);
  },

  async registerProposalWithSignature(callId: string, proposal: string, signature: string, signer: string) {
    return CallService.registerProposalWithSignature(callId, proposal, signature, signer);
  },

  async getProposalData(callId: string, proposal: string) {
    return CallService.getProposalData(callId, proposal);
  },

  async verifyProposalWithSignature(callId: string, proposal: string) {
    return CallService.verifyProposalWithSignature(callId, proposal);
  },

  async getClosingTime(callId: string) {
    return CallService.getClosingTime(callId);
  },

  async getCalls() {
    return CallService.getCalls();
  },

  async getContractAddress() {
    const data = await ContractService.getContractAddresses();
    return data.cfpFactoryAddress;
  },

  async createCall(callId: string, closingTimeIso: string, signature: string) {
    return CallService.createCall({
      callId,
      closingTime: closingTimeIso,
      signature,
    });
  },

  async createCallWithENS(callId: string, closingTimeIso: string, signature: string, callName: string, description?: string) {
    return CallService.createCallWithENS({
      callId,
      closingTime: closingTimeIso,
      signature,
      callName,
      description,
    });
  },

  async getProposalCounts(callIds: string[]) {
    const callIdsParam = callIds.join(',');
    return CallService.getProposalCounts(callIdsParam);
  },
}; 