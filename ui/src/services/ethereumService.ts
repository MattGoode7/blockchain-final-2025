import { ethers } from 'ethers';
import { CFPFactory__factory, CFP__factory } from '../types/factories';
import { FactoryService } from './factoryService.ts';
import { CFPService } from './cfpService.ts';
import { ENSService } from './ensService.ts';
import { ContractService } from './contractService';
import { CFPApiService } from './cfpApiService';

export class EthereumService {
  private provider: ethers.BrowserProvider | null = null;
  public signer: ethers.Signer | null = null;
  public factoryService: FactoryService | null = null;
  public ensService: ENSService | null = null;
  public factoryAddress: string | null = null;
  private expectedChainId: number = 1337; // Ajustar según la red que uses
  private currentAddress: string | null = null;

  private setupListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length > 0) {
        this.currentAddress = accounts[0];
        await this.connect();
      } else {
        this.disconnect();
      }
    });

    window.ethereum.on('chainChanged', async () => {
      await this.connect();
    });
  }

  generateCallId(title: string, description: string): string {
    const content = `${title}${description}${Date.now()}`;
    return ethers.keccak256(ethers.toUtf8Bytes(content));
  }

  async connect() {
    try {
      if (!window.ethereum) {
        throw new Error('Por favor instala MetaMask para usar esta aplicación');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la cuenta');
      }

      this.currentAddress = accounts[0];

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.expectedChainId) {
        throw new Error(`Por favor conéctate a la red correcta (Chain ID: ${this.expectedChainId})`);
      }

      const data = await ContractService.getContractAddresses();
      this.factoryAddress = data.cfpFactoryAddress;

      if (!this.factoryAddress) {
        throw new Error('No se pudo obtener la dirección del contrato');
      }

      const factoryContract = CFPFactory__factory.connect(
        this.factoryAddress,
        this.signer
      );

      this.factoryService = new FactoryService(factoryContract, this.signer);

      // Inicializar servicio ENS
      this.ensService = new ENSService(this.signer);
      await this.ensService.initializeContracts();

      this.setupListeners();

      return true;
    } catch (error) {
      console.error('Error al conectar con MetaMask:', error);
      throw error;
    }
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.factoryService = null;
    this.ensService = null;
    this.factoryAddress = null;
    this.currentAddress = null;
  }

  async checkConnection() {
    if (!window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) return false;

      if (!this.provider) {
        await this.connect();
      }
      return true;
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      return false;
    }
  }

  getCurrentAddress(): string | null {
    return this.currentAddress;
  }

  async getCFPService(callId: string): Promise<CFPService> {
    if (!this.signer) {
      throw new Error('No hay conexión con MetaMask');
    }

    try {
      const data = await CFPApiService.getCfpInfo(callId);

      if (!data.cfp) {
        throw new Error('No se encontró el contrato CFP');
      }

      const cfpContract = CFP__factory.connect(data.cfp, this.signer);
      return new CFPService(cfpContract);
    } catch (error) {
      console.error('Error al obtener el servicio CFP:', error);
      throw error;
    }
  }

  // Métodos delegados al FactoryService
  async registerAccount() {
    if (!this.factoryService) {
      throw new Error('No hay conexión con MetaMask');
    }
    return this.factoryService.registerAccount();
  }

  async isAuthorized(address: string) {
    if (!this.factoryService) {
      throw new Error('No hay conexión con MetaMask');
    }
    return this.factoryService.isAuthorized(address);
  }

  async getRegistrationRequests() {
    if (!this.factoryService) {
      throw new Error('No hay conexión con MetaMask');
    }
    return this.factoryService.getRegistrationRequests();
  }

  async authorizeRegistration(address: string) {
    if (!this.factoryService) {
      throw new Error('No hay conexión con MetaMask');
    }
    return this.factoryService.authorizeRegistration(address);
  }

  async createCFP(callId: string, closingTime: number) {
    if (!this.factoryService) {
      throw new Error('No hay conexión con MetaMask');
    }
    return this.factoryService.createCFP(callId, closingTime);
  }

  // Métodos delegados al CFPService
  async registerProposal(callId: string, proposal: string) {
    const cfpService = await this.getCFPService(callId);
    return cfpService.registerProposal(proposal);
  }

  async getProposals(callId: string) {
    const cfpService = await this.getCFPService(callId);
    return cfpService.getProposals();
  }

  async verifyProposal(callId: string, proposalId: string) {
    const cfpService = await this.getCFPService(callId);
    return cfpService.verifyProposal(proposalId);
  }

  async signMessage(message: string | ethers.BytesLike): Promise<string> {
    if (!this.signer) {
      throw new Error('No hay conexión con MetaMask');
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error al firmar mensaje:', error);
      throw error;
    }
  }

  /**
   * Obtiene el servicio ENS inicializado
   */
  getENSService(): ENSService | null {
    return this.ensService;
  }
}

// Declaración para TypeScript global
declare global {
  interface Window {
    ethereum: any;
  }
}

export const ethereumService = new EthereumService(); 