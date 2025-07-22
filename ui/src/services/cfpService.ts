import { ethers } from 'ethers';
import { CFP__factory } from '../types/factories';

export class CFPService {
  private contract: ReturnType<typeof CFP__factory.connect>;

  constructor(contract: ReturnType<typeof CFP__factory.connect>) {
    this.contract = contract;
  }

  async registerProposal(proposal: string): Promise<ethers.ContractTransactionReceipt | null> {
    const tx = await this.contract.registerProposal(proposal);
    return await tx.wait();
  }

  async getProposals(): Promise<Array<{
    id: string;
    sender: string;
    blockNumber: number;
    timestamp: number;
  }>> {
    const count = await this.contract.proposalCount();
    const proposals = [];
    
    for (let i = 0; i < count; i++) {
      const proposal = await this.contract.proposals(i);
      const data = await this.contract.proposalData(proposal);
      proposals.push({
        id: proposal,
        sender: data.sender,
        blockNumber: Number(data.blockNumber),
        timestamp: Number(data.timestamp)
      });
    }
    
    return proposals;
  }

  async verifyProposal(proposalId: string): Promise<boolean> {
    try {
      const data = await this.contract.proposalData(proposalId);
      return data.sender !== ethers.ZeroAddress;
    } catch {
      return false;
    }
  }
} 