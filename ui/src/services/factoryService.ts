import { ethers } from 'ethers';

export interface FactoryContract extends ethers.BaseContract {
  isRegistered(address: string): Promise<boolean>;
  isAuthorized(address: string): Promise<boolean>;
  owner(): Promise<string>;
  getAllPending(): Promise<string[]>;
  register(): Promise<ethers.ContractTransactionResponse>;
  authorize(address: string): Promise<ethers.ContractTransactionResponse>;
  create(callId: string, closingTime: number): Promise<ethers.ContractTransactionResponse>;
  createFor(callId: string, closingTime: number, address: string): Promise<ethers.ContractTransactionResponse>;
  connect(signer: ethers.Signer): FactoryContract;
}

interface CFPCreatedEvent {
  args: {
    cfp: string;
  };
}

export class FactoryService {
  public contract: FactoryContract;
  private signer: ethers.Signer;

  constructor(contract: FactoryContract, signer: ethers.Signer) {
    this.contract = contract;
    this.signer = signer;
  }

  async registerAccount(): Promise<ethers.ContractTransactionReceipt> {
    const address = await this.signer.getAddress();
    const isRegistered = await this.contract.isRegistered(address);
    if (isRegistered) {
      throw new Error('Tu cuenta ya está registrada');
    }
    const contractWithSigner = this.contract.connect(this.signer);
    const tx = await contractWithSigner.register();
    const receipt = await tx.wait();
    if (!receipt) throw new Error('Transacción fallida');
    return receipt;
  }

  async isAuthorized(address: string): Promise<boolean> {
    return await this.contract.isAuthorized(address);
  }

  async getRegistrationRequests(): Promise<{ address: string; timestamp: number }[]> {
    const owner = await this.contract.owner();
    const signerAddress = await this.signer.getAddress();
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error('Solo el dueño de la factoría puede ver las solicitudes de registro');
    }
    let pending = await this.contract.getAllPending();
    if (!Array.isArray(pending)) {
      pending = [];
    }
    return pending.map((address: string) => ({ address, timestamp: 0 }));
  }

  async authorizeRegistration(address: string): Promise<ethers.ContractTransactionReceipt> {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      throw new Error('Dirección inválida para autorizar');
    }
    const owner = await this.contract.owner();
    const signerAddress = await this.signer.getAddress();
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error('Solo el dueño de la factoría puede autorizar registros');
    }
    const contractWithSigner = this.contract.connect(this.signer);
    const tx = await contractWithSigner.authorize(address);
    const receipt = await tx.wait();
    if (!receipt) throw new Error('Transacción fallida');
    return receipt;
  }

  async createCFP(callId: string, closingTime: number): Promise<{ receipt: ethers.ContractTransactionReceipt, cfpAddress: string }> {
    const address = await this.signer.getAddress();
    const isAuthorized = await this.contract.isAuthorized(address);
    if (!isAuthorized) {
      throw new Error('Tu cuenta no está autorizada para crear CFP. Por favor, regístrate primero.');
    }

    const owner = await this.contract.owner();
    const isAdmin = owner.toLowerCase() === address.toLowerCase();

    const contractWithSigner = this.contract.connect(this.signer);
    let tx;

    if (isAdmin) {
      tx = await contractWithSigner.createFor(callId, closingTime, address);
    } else {
      tx = await contractWithSigner.create(callId, closingTime);
    }

    const receipt = await tx.wait();
    if (!receipt) throw new Error('Transacción fallida');
    
    const event = receipt.logs.find((log: any) => 
      log.fragment && log.fragment.name === 'CFPCreated'
    ) as CFPCreatedEvent | undefined;
    
    if (!event?.args?.cfp) {
      throw new Error('No se pudo obtener la dirección del contrato CFP');
    }
    
    return {
      receipt,
      cfpAddress: event.args.cfp
    };
  }
} 