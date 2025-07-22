import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Web3Service } from '../web3/web3.service';
import { Signer } from 'ethers';
import { 
  CFPFactory__factory, 
  CFP__factory,
  ENSRegistry__factory,
  PublicResolver__factory,
  ReverseRegistrar__factory,
  LlamadosRegistrar__factory,
  UsuariosRegistrar__factory
} from './types/factories';
import { ContractsConfig } from '../config/contracts.config';
import { ENSService } from './ens.service';

@Injectable()
export class ContractsService {
  private readonly factoryContract: ReturnType<typeof CFPFactory__factory.connect>;
  private readonly ensRegistryContract: ReturnType<typeof ENSRegistry__factory.connect>;
  private readonly publicResolverContract: ReturnType<typeof PublicResolver__factory.connect>;
  private readonly reverseRegistrarContract: ReturnType<typeof ReverseRegistrar__factory.connect>;
  private readonly llamadosRegistrarContract: ReturnType<typeof LlamadosRegistrar__factory.connect>;
  private readonly usuariosRegistrarContract: ReturnType<typeof UsuariosRegistrar__factory.connect>;
  private readonly ensService: ENSService;

  constructor(
    private readonly configService: ConfigService,
    private readonly web3Service: Web3Service,
  ) {
    const contractsConfig = this.configService.get<ContractsConfig>('contracts');
    
    if (!contractsConfig) {
      throw new Error('Configuración de contratos no encontrada');
    }

    const signer: Signer = this.web3Service.getWallet();

    // Inicializar contratos con las direcciones desde variables de entorno
    this.factoryContract = CFPFactory__factory.connect(contractsConfig.cfpFactoryAddress, signer);
    this.ensRegistryContract = ENSRegistry__factory.connect(contractsConfig.ensRegistryAddress, signer);
    this.publicResolverContract = PublicResolver__factory.connect(contractsConfig.publicResolverAddress, signer);
    this.reverseRegistrarContract = ReverseRegistrar__factory.connect(contractsConfig.reverseRegistrarAddress, signer);
    this.llamadosRegistrarContract = LlamadosRegistrar__factory.connect(contractsConfig.llamadosRegistrarAddress, signer);
    this.usuariosRegistrarContract = UsuariosRegistrar__factory.connect(contractsConfig.usuariosRegistrarAddress, signer);
    
    // Inicializar el servicio ENS
    this.ensService = new ENSService(this.configService, this.web3Service);
  }

  getFactory(): ReturnType<typeof CFPFactory__factory.connect> {
    return this.factoryContract;
  }

  getENSRegistry(): ReturnType<typeof ENSRegistry__factory.connect> {
    return this.ensRegistryContract;
  }

  getPublicResolver(): ReturnType<typeof PublicResolver__factory.connect> {
    return this.publicResolverContract;
  }

  getReverseRegistrar(): ReturnType<typeof ReverseRegistrar__factory.connect> {
    return this.reverseRegistrarContract;
  }

  getLlamadosRegistrar(): ReturnType<typeof LlamadosRegistrar__factory.connect> {
    return this.llamadosRegistrarContract;
  }

  getUsuariosRegistrar(): ReturnType<typeof UsuariosRegistrar__factory.connect> {
    return this.usuariosRegistrarContract;
  }

  getENSService(): ENSService {
    return this.ensService;
  }

  /* Devuelve instancia de CFP dado un callId */
  async getCfpById(callId: string): Promise<{ contract: ReturnType<typeof CFP__factory.connect>; address: string }> {
    const callData = await this.factoryContract.calls(callId);
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    if (callData.creator === ZERO_ADDRESS) {
      throw new Error('CALLID_NOT_FOUND');
    }

    const cfpAddress = callData.cfp;
    const signer: Signer = this.web3Service.getWallet();
    const contract = CFP__factory.connect(cfpAddress, signer);
    return { contract, address: cfpAddress };
  }
} 