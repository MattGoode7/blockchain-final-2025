import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { 
  ENS__factory, 
  PublicResolver__factory,
  ReverseRegistrar__factory,
  FIFSRegistrar__factory,
  LlamadosRegistrar__factory,
  UsuariosRegistrar__factory
} from './types/factories';
import { Web3Service } from '../web3/web3.service';

export interface ENSConfig {
  ensRegistryAddress: string;
  publicResolverAddress: string;
  reverseRegistrarAddress: string;
  llamadosRegistrarAddress: string;
  usuariosRegistrarAddress: string;
}

export interface ENSNameInfo {
  name: string;
  address: string;
  description?: string;
  reverseName?: string;
}

@Injectable()
export class ENSService {
  private readonly logger = new Logger(ENSService.name);
  public ensRegistry: ReturnType<typeof ENS__factory.connect>;
  public publicResolver: ReturnType<typeof PublicResolver__factory.connect>;
  public reverseRegistrar: ReturnType<typeof ReverseRegistrar__factory.connect>;
  private llamadosRegistrar: ReturnType<typeof LlamadosRegistrar__factory.connect>;
  private usuariosRegistrar: ReturnType<typeof UsuariosRegistrar__factory.connect>;
  private wallet: ethers.HDNodeWallet;

  constructor(
    private readonly configService: ConfigService,
    private readonly web3Service: Web3Service,
  ) {
    this.wallet = this.web3Service.getWallet();
    this.initializeContracts();
  }

  private initializeContracts() {
    const ensRegistryAddress = this.configService.get<string>('contracts.ensRegistryAddress');
    const publicResolverAddress = this.configService.get<string>('contracts.publicResolverAddress');
    const reverseRegistrarAddress = this.configService.get<string>('contracts.reverseRegistrarAddress');
    const llamadosRegistrarAddress = this.configService.get<string>('contracts.llamadosRegistrarAddress');
    const usuariosRegistrarAddress = this.configService.get<string>('contracts.usuariosRegistrarAddress');

    if (!ensRegistryAddress || !publicResolverAddress || !reverseRegistrarAddress || 
        !llamadosRegistrarAddress || !usuariosRegistrarAddress) {
      throw new Error('Direcciones de contratos ENS no configuradas');
    }

    this.ensRegistry = ENS__factory.connect(ensRegistryAddress, this.wallet);
    this.publicResolver = PublicResolver__factory.connect(publicResolverAddress, this.wallet);
    this.reverseRegistrar = ReverseRegistrar__factory.connect(reverseRegistrarAddress, this.wallet);
    this.llamadosRegistrar = LlamadosRegistrar__factory.connect(llamadosRegistrarAddress, this.wallet);
    this.usuariosRegistrar = UsuariosRegistrar__factory.connect(usuariosRegistrarAddress, this.wallet);
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
   * Registra un nombre de usuario en el dominio usuarios.cfp
   */
  async registerUserName(userName: string, userAddress: string, description?: string): Promise<ethers.ContractTransactionReceipt> {
    try {
      const fullName = `${userName}.usuarios.cfp`;
      const node = this.namehash(fullName);
      
      // Verificar si el nombre ya está registrado
      const owner = await this.ensRegistry.owner(node);
      if (owner !== '0x0000000000000000000000000000000000000000') {
        throw new Error('El nombre de usuario ya está registrado');
      }

      // Registrar el nombre
      const tx = await this.usuariosRegistrar.register(userName, userAddress);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error('Transacción fallida');

      // Configurar el resolver y la dirección
      await this.setupUserResolver(node, userAddress, fullName, description);

      return receipt;
    } catch (error) {
      this.logger.error(`Error al registrar nombre de usuario: ${error.message}`);
      throw error;
    }
  }

  /**
   * Registra un nombre de llamado en el dominio llamados.cfp
   */
  async registerCallName(callName: string, callAddress: string, description?: string): Promise<ethers.ContractTransactionReceipt> {
    try {
      this.logger.log(`Registrando llamado: ${callName} -> ${callAddress}`);
      
      const fullName = `${callName}.llamados.cfp`;
      const node = this.namehash(fullName);
      
      // Verificar si el nombre ya está registrado
      const owner = await this.ensRegistry.owner(node);
      
      if (owner !== '0x0000000000000000000000000000000000000000') {
        throw new Error('El nombre del llamado ya está registrado');
      }

      // Registrar el nombre
      const tx = await this.llamadosRegistrar.register(callName, callAddress);
      const receipt = await tx.wait();
      
      if (!receipt) throw new Error('Transacción fallida');

      // Configurar el resolver y la dirección
      await this.setupCallResolver(node, callAddress, fullName, description);
      this.logger.log(`Llamado registrado exitosamente: ${callName}`);

      return receipt;
    } catch (error) {
      this.logger.error(`Error al registrar llamado ${callName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configura el resolver para un usuario
   */
  private async setupUserResolver(node: string, userAddress: string, fullName: string, description?: string): Promise<void> {
    const resolverAddress = this.configService.get<string>('contracts.publicResolverAddress');
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
    await this.setupReverseResolution(userAddress, fullName);
  }

  /**
   * Configura el resolver para un llamado
   */
  private async setupCallResolver(node: string, callAddress: string, fullName: string, description?: string): Promise<void> {
    const resolverAddress = this.configService.get<string>('contracts.publicResolverAddress');
    if (!resolverAddress) throw new Error('Dirección del resolver no configurada');

    // Configurar el resolver
    await this.ensRegistry.setResolver(node, resolverAddress);
    
    // Configurar la dirección
    await this.publicResolver.setAddr(node, callAddress);
    
    // Configurar la descripción si se proporciona
    if (description) {
      await this.publicResolver.setText(node, 'description', description);
    }

    // Configurar resolución reversa
    await this.setupReverseResolution(callAddress, fullName);
  }

  /**
   * Configura la resolución reversa para una dirección usando ReverseRegistrar
   */
  private async setupReverseResolution(address: string, ensName: string): Promise<void> {
    try {
      // Usar el método setNameForAddress para configurar el nombre reverso
      const setNameTx = await this.reverseRegistrar.setNameForAddress(address, ensName);
      await setNameTx.wait();
    } catch (error) {
      this.logger.error(`Error al configurar resolución reversa para ${address}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resuelve una dirección a partir de un nombre ENS
   */
  async resolveName(name: string): Promise<string | null> {
    try {
      const node = this.namehash(name);
      const resolverAddress = await this.ensRegistry.resolver(node);
      
      if (resolverAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const resolver = PublicResolver__factory.connect(resolverAddress, this.wallet);
      return await resolver.addr(node);
    } catch (error) {
      this.logger.error(`Error al resolver nombre: ${error.message}`);
      return null;
    }
  }

  /**
   * Resuelve un nombre a partir de una dirección (resolución reversa)
   */
  async resolveAddress(address: string): Promise<string | null> {
    try {
      // Obtener el nodo reverso usando el ReverseRegistrar
      const reverseNode = await this.reverseRegistrar.node(address);
      
      // Obtener el resolver para este nodo
      const resolverAddress = await this.ensRegistry.resolver(reverseNode);
      
      if (resolverAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Usar el resolver para obtener el nombre
      const resolver = PublicResolver__factory.connect(resolverAddress, this.wallet);
      return await resolver.name(reverseNode);
    } catch (error) {
      this.logger.error(`Error al resolver dirección: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtiene información completa de un nombre ENS
   */
  async getNameInfo(name: string): Promise<ENSNameInfo | null> {
    try {
      const node = this.namehash(name);
      const resolverAddress = await this.ensRegistry.resolver(node);
      
      if (resolverAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const resolver = PublicResolver__factory.connect(resolverAddress, this.wallet);
      const address = await resolver.addr(node);
      const description = await resolver.text(node, 'description');
      const reverseName = await this.resolveAddress(address);

      return {
        name,
        address,
        description: description || undefined,
        reverseName: reverseName || undefined
      };
    } catch (error) {
      this.logger.error(`Error al obtener información del nombre: ${error.message}`);
      return null;
    }
  }

  /**
   * Verifica si un nombre está disponible
   */
  async isNameAvailable(name: string): Promise<boolean> {
    try {
      const node = this.namehash(name);
      const owner = await this.ensRegistry.owner(node);
      return owner === '0x0000000000000000000000000000000000000000';
    } catch (error) {
      this.logger.error(`Error al verificar disponibilidad del nombre: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtiene todos los nombres registrados en un dominio
   */
  async getRegisteredNames(domain: 'usuarios.cfp' | 'llamados.cfp'): Promise<string[]> {
    try {
      // Esta implementación dependerá de cómo esté estructurado el registrar
      // Por ahora retornamos un array vacío
      return [];
    } catch (error) {
      this.logger.error(`Error al obtener nombres registrados: ${error.message}`);
      return [];
    }
  }
} 