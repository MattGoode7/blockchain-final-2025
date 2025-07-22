import { ethers } from 'ethers';
import { 
  ENS__factory, 
  PublicResolver__factory,
  LlamadosRegistrar__factory,
  UsuariosRegistrar__factory
} from '../types/factories';
import { ContractService } from './contractService';
import { ENSApiService } from './ensApiService';

export interface ENSNameInfo {
  name: string;
  address: string;
  description?: string;
  reverseName?: string;
}

export class ENSService {
  private signer: ethers.Signer | null = null;
  private ensRegistry: ReturnType<typeof ENS__factory.connect> | null = null;
  private publicResolver: ReturnType<typeof PublicResolver__factory.connect> | null = null;
  private llamadosRegistrar: ReturnType<typeof LlamadosRegistrar__factory.connect> | null = null;
  private usuariosRegistrar: ReturnType<typeof UsuariosRegistrar__factory.connect> | null = null;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
  }

  /**
   * Inicializa los contratos ENS
   */
  async initializeContracts() {
    try {
      const data = await ContractService.getContractAddresses();

      if (!data.ensRegistryAddress || !data.publicResolverAddress || 
          !data.reverseRegistrarAddress || !data.llamadosRegistrarAddress || 
          !data.usuariosRegistrarAddress) {
        throw new Error('Direcciones de contratos ENS no configuradas');
      }

      this.ensRegistry = ENS__factory.connect(data.ensRegistryAddress, this.signer);
      this.publicResolver = PublicResolver__factory.connect(data.publicResolverAddress, this.signer);
      this.llamadosRegistrar = LlamadosRegistrar__factory.connect(data.llamadosRegistrarAddress, this.signer);
      this.usuariosRegistrar = UsuariosRegistrar__factory.connect(data.usuariosRegistrarAddress, this.signer);
    } catch (error) {
      console.error('Error al inicializar contratos ENS:', error);
      throw error;
    }
  }

  /**
   * Genera el hash de un nombre ENS
   */
  private namehash(name: string): string {
    if (!name) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    const labels = name.split('.').reverse();
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    for (const label of labels) {
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(label));
      node = ethers.keccak256(ethers.concat([node, labelHash]));
    }
    
    return node;
  }

  /**
   * Registra un nombre de usuario usando MetaMask
   */
  async registerUserNameWithMetaMask(userName: string, description?: string): Promise<ethers.ContractTransactionReceipt> {
    if (!this.usuariosRegistrar || !this.signer) {
      throw new Error('Contratos ENS no inicializados');
    }

    try {
      const userAddress = await this.signer.getAddress();
      const fullName = `${userName}.usuarios.cfp`;
      const node = this.namehash(fullName);

      // Verificar si el nombre ya está registrado
      if (!this.ensRegistry) {
        throw new Error('Registro ENS no inicializado');
      }

      const owner = await this.ensRegistry.owner(node);
      if (owner !== '0x0000000000000000000000000000000000000000') {
        throw new Error('El nombre de usuario ya está registrado');
      }

      // Registrar el nombre
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(userName));
      const tx = await this.usuariosRegistrar.register(labelHash, userAddress);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error('Transacción fallida');

      // Configurar el resolver y la dirección
      await this.setupUserResolver(node, userAddress, userName, description);

      return receipt;
    } catch (error) {
      console.error('Error al registrar nombre de usuario:', error);
      throw error;
    }
  }

  /**
   * Registra un nombre de llamado usando MetaMask
   */
  async registerCallNameWithMetaMask(callName: string, callAddress: string, description?: string): Promise<ethers.ContractTransactionReceipt> {
    if (!this.llamadosRegistrar || !this.signer) {
      throw new Error('Contratos ENS no inicializados');
    }

    try {
      const fullName = `${callName}.llamados.cfp`;
      const node = this.namehash(fullName);

      // Verificar si el nombre ya está registrado
      if (!this.ensRegistry) {
        throw new Error('Registro ENS no inicializado');
      }

      const owner = await this.ensRegistry.owner(node);
      if (owner !== '0x0000000000000000000000000000000000000000') {
        throw new Error('El nombre del llamado ya está registrado');
      }

      // Registrar el nombre
      const userAddress = await this.signer.getAddress();
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(callName));
      const tx = await this.llamadosRegistrar.register(labelHash, userAddress);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error('Transacción fallida');

      // Configurar el resolver y la dirección
      await this.setupCallResolver(node, callAddress, fullName, description);

      return receipt;
    } catch (error) {
      console.error('Error al registrar nombre de llamado:', error);
      throw error;
    }
  }

  /**
   * Configura el resolver para un usuario
   */
  private async setupUserResolver(node: string, userAddress: string, userName: string, description?: string): Promise<void> {
    if (!this.ensRegistry || !this.publicResolver) {
      throw new Error('Contratos ENS no inicializados');
    }

    const data = await ContractService.getContractAddresses();
    const resolverAddress = data.publicResolverAddress;

    if (!resolverAddress) throw new Error('Dirección del resolver no configurada');

    // Configurar el resolver
    await this.ensRegistry.setResolver(node, resolverAddress);
    
    // Configurar la dirección
    await this.publicResolver.setAddr(node, userAddress);
    
    // Configurar la descripción si se proporciona
    if (description) {
      await this.publicResolver.setText(node, 'description', description);
    }

    // Configurar resolución reversa
    const fullName = `${userName}.usuarios.cfp`;
    await this.setupReverseResolution(fullName, userAddress);
  }

  /**
   * Configura el resolver para un llamado
   */
  private async setupCallResolver(node: string, callAddress: string, fullName: string, description?: string): Promise<void> {
    if (!this.ensRegistry || !this.publicResolver) {
      throw new Error('Contratos ENS no inicializados');
    }

    const data = await ContractService.getContractAddresses();
    const resolverAddress = data.publicResolverAddress;

    if (!resolverAddress) throw new Error('Dirección del resolver no configurada');

    // Configurar el resolver
    await this.ensRegistry.setResolver(node, resolverAddress);
    
    // Configurar la dirección del contrato CFP
    await this.publicResolver.setAddr(node, callAddress);
    
    // Configurar la descripción si se proporciona
    if (description) {
      await this.publicResolver.setText(node, 'description', description);
    }

    // Configurar resolución reversa
    await this.setupReverseResolution(fullName, callAddress);
  }

  /**
   * Configura la resolución reversa para una dirección
   */
  private async setupReverseResolution(fullName: string, contractAddress: string): Promise<void> {
    try {
      if (!this.signer) {
        throw new Error('Signer no inicializado');
      }

      const data = await ContractService.getContractAddresses();
      const reverseRegistrarAddress = data.reverseRegistrarAddress;
      
      if (!reverseRegistrarAddress) {
        throw new Error('Dirección del ReverseRegistrar no configurada');
      }

      // Importar el ReverseRegistrar
      const { ReverseRegistrar__factory } = await import('../types/factories/ReverseRegistrar__factory');
      const reverseRegistrar = ReverseRegistrar__factory.connect(reverseRegistrarAddress, this.signer);
      
      // Configurar el nombre reverso usando el nuevo método setNameForAddress
      // Esto configurará la resolución inversa para la dirección específica del contrato CFP
      await reverseRegistrar.setNameForAddress(contractAddress, fullName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.warn(`Error al configurar resolución reversa: ${errorMessage}`);
    }
  }

  /**
   * Resuelve una dirección a partir de un nombre ENS
   */
  async resolveName(name: string): Promise<string | null> {
    try {
      const response = await ENSApiService.resolveName(name);
      return response.success ? response.address || null : null;
    } catch (error) {
      console.error('Error al resolver nombre:', error);
      return null;
    }
  }

  /**
   * Resuelve un nombre a partir de una dirección (resolución reversa)
   */
  async resolveAddress(address: string): Promise<string | null> {
    try {
      const response = await ENSApiService.resolveAddress(address);
      return response.success ? response.name || null : null;
    } catch (error) {
      console.error('Error al resolver dirección:', error);
      return null;
    }
  }

  /**
   * Obtiene información completa de un nombre ENS
   */
  async getNameInfo(name: string): Promise<ENSNameInfo | null> {
    try {
      const response = await ENSApiService.getNameInfo(name);
      return response.success ? response.nameInfo || null : null;
    } catch (error) {
      console.error('Error al obtener información del nombre:', error);
      return null;
    }
  }

  /**
   * Verifica si un nombre está disponible
   */
  async isNameAvailable(name: string): Promise<boolean> {
    try {
      const response = await ENSApiService.checkNameAvailability(name);
      return response.success ? response.isAvailable : false;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  }
} 