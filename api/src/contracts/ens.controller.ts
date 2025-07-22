import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ENSService, ENSNameInfo } from './ens.service';

export interface RegisterUserNameDto {
  userName: string;
  userAddress: string;
  description?: string;
}

export interface RegisterCallNameDto {
  callName: string;
  callAddress: string;
  description?: string;
}

export interface ResolveNameDto {
  name: string;
}

export interface ResolveAddressDto {
  address: string;
}

export interface ResolveMultipleAddressesDto {
  addresses: string[];
}

@Controller('ens')
export class ENSController {
  constructor(private readonly ensService: ENSService) {}

  /**
   * Registra un nombre de usuario en el dominio usuarios.cfp
   */
  @Post('register-user')
  async registerUserName(@Body() dto: RegisterUserNameDto) {
    try {
      const receipt = await this.ensService.registerUserName(
        dto.userName,
        dto.userAddress,
        dto.description
      );
      
      return {
        success: true,
        message: 'Nombre de usuario registrado exitosamente',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new HttpException(
        `Error al registrar nombre de usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Registra un nombre de llamado en el dominio llamados.cfp
   */
  @Post('register-call')
  async registerCallName(@Body() dto: RegisterCallNameDto) {
    try {
      const receipt = await this.ensService.registerCallName(
        dto.callName,
        dto.callAddress,
        dto.description
      );
      
      return {
        success: true,
        message: 'Nombre de llamado registrado exitosamente',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new HttpException(
        `Error al registrar nombre de llamado: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Resuelve una dirección a partir de un nombre ENS
   */
  @Get('resolve-name/:name')
  async resolveName(@Param('name') name: string) {
    try {
      const address = await this.ensService.resolveName(name);
      
      if (!address) {
        return {
          success: false,
          message: 'Nombre no encontrado',
          address: null
        };
      }

      return {
        success: true,
        name,
        address
      };
    } catch (error) {
      throw new HttpException(
        `Error al resolver nombre: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Resuelve un nombre a partir de una dirección (resolución reversa)
   */
  @Get('resolve-address/:address')
  async resolveAddress(@Param('address') address: string) {
    try {
      const name = await this.ensService.resolveAddress(address);
      
      if (!name) {
        return {
          success: false,
          message: 'Dirección no encontrada',
          name: null
        };
      }

      return {
        success: true,
        address,
        name
      };
    } catch (error) {
      throw new HttpException(
        `Error al resolver dirección: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Resuelve múltiples direcciones de una vez
   */
  @Post('resolve-addresses')
  async resolveMultipleAddresses(@Body() dto: ResolveMultipleAddressesDto) {
    try {
      const results: { [address: string]: string | null } = {};
      
      // Resolver todas las direcciones en paralelo
      const promises = dto.addresses.map(async (address) => {
        try {
          const name = await this.ensService.resolveAddress(address);
          return { address, name };
        } catch (error) {
          console.error(`Error resolviendo dirección ${address}:`, error);
          return { address, name: null };
        }
      });

      const resolvedAddresses = await Promise.all(promises);
      
      // Convertir a objeto
      resolvedAddresses.forEach(({ address, name }) => {
        results[address] = name;
      });

      return {
        success: true,
        results
      };
    } catch (error) {
      throw new HttpException(
        `Error al resolver direcciones: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Obtiene información completa de un nombre ENS
   */
  @Get('name-info/:name')
  async getNameInfo(@Param('name') name: string) {
    try {
      const nameInfo = await this.ensService.getNameInfo(name);
      
      if (!nameInfo) {
        return {
          success: false,
          message: 'Nombre no encontrado',
          nameInfo: null
        };
      }

      return {
        success: true,
        nameInfo
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener información del nombre: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Verifica si un nombre está disponible
   */
  @Get('check-availability/:name')
  async checkNameAvailability(@Param('name') name: string) {
    try {
      const isAvailable = await this.ensService.isNameAvailable(name);
      
      return {
        success: true,
        name,
        isAvailable
      };
    } catch (error) {
      throw new HttpException(
        `Error al verificar disponibilidad: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Obtiene todos los nombres registrados en un dominio
   */
  @Get('registered-names')
  async getRegisteredNames(@Query('domain') domain: 'usuarios.cfp' | 'llamados.cfp') {
    try {
      const names = await this.ensService.getRegisteredNames(domain);
      
      return {
        success: true,
        domain,
        names
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener nombres registrados: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
} 