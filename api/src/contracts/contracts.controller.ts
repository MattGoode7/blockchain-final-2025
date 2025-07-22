import { Controller, Get, Param } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('factory')
  async getFactoryInfo() {
    const factory = this.contractsService.getFactory();
    const address = await factory.getAddress();
    return {
      contract: 'CFPFactory',
      address,
      methods: ['createCall', 'calls', 'getCallCount']
    };
  }

  @Get('ens-registry')
  async getENSRegistryInfo() {
    const registry = this.contractsService.getENSRegistry();
    const address = await registry.getAddress();
    return {
      contract: 'ENSRegistry',
      address,
      methods: ['register', 'setOwner', 'setSubnodeOwner']
    };
  }

  @Get('public-resolver')
  async getPublicResolverInfo() {
    const resolver = this.contractsService.getPublicResolver();
    const address = await resolver.getAddress();
    return {
      contract: 'PublicResolver',
      address,
      methods: ['setAddr', 'setText', 'setContenthash']
    };
  }

  @Get('reverse-registrar')
  async getReverseRegistrarInfo() {
    const registrar = this.contractsService.getReverseRegistrar();
    const address = await registrar.getAddress();
    return {
      contract: 'ReverseRegistrar',
      address,
      methods: ['claim', 'setName']
    };
  }

  @Get('llamados-registrar')
  async getLlamadosRegistrarInfo() {
    const registrar = this.contractsService.getLlamadosRegistrar();
    const address = await registrar.getAddress();
    return {
      contract: 'LlamadosRegistrar',
      address,
      methods: ['register', 'isRegistered']
    };
  }

  @Get('usuarios-registrar')
  async getUsuariosRegistrarInfo() {
    const registrar = this.contractsService.getUsuariosRegistrar();
    const address = await registrar.getAddress();
    return {
      contract: 'UsuariosRegistrar',
      address,
      methods: ['register', 'isRegistered']
    };
  }

  @Get('cfp/:callId')
  async getCfpInfo(@Param('callId') callId: string) {
    try {
      const { contract, address } = await this.contractsService.getCfpById(callId);
      return {
        contract: 'CFP',
        callId,
        address,
        methods: ['submitProposal', 'getProposals', 'getProposalCount']
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }

  @Get('addresses')
  async getAllAddresses() {
    const factory = this.contractsService.getFactory();
    const ensRegistry = this.contractsService.getENSRegistry();
    const publicResolver = this.contractsService.getPublicResolver();
    const reverseRegistrar = this.contractsService.getReverseRegistrar();
    const llamadosRegistrar = this.contractsService.getLlamadosRegistrar();
    const usuariosRegistrar = this.contractsService.getUsuariosRegistrar();

    return {
      cfpFactoryAddress: await factory.getAddress(),
      ensRegistryAddress: await ensRegistry.getAddress(),
      publicResolverAddress: await publicResolver.getAddress(),
      reverseRegistrarAddress: await reverseRegistrar.getAddress(),
      llamadosRegistrarAddress: await llamadosRegistrar.getAddress(),
      usuariosRegistrarAddress: await usuariosRegistrar.getAddress(),
    };
  }
} 