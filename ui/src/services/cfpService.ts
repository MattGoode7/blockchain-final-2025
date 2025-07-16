import { ethers } from 'ethers';

export class CFPService {
  private contract: ethers.Contract;

  constructor(contract: ethers.Contract) {
    this.contract = contract;
  }

  async registerProposal(proposal: string): Promise<ethers.TransactionReceipt> {
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
        blockNumber: data.blockNumber,
        timestamp: data.timestamp
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