import { Injectable } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { RegisterDto } from './dto/register.dto';
import { isValidAddress, isValidSignature } from '../utils/validation.utils';
import {
  INVALID_ADDRESS,
  INVALID_SIGNATURE,
  ALREADY_AUTHORIZED,
  UNAUTHORIZED,
  INTERNAL_ERROR,
  OK,
} from '../utils/messages';
import { ethers } from 'ethers';

@Injectable()
export class AuthorizationService {
  constructor(private readonly contractsService: ContractsService) {}

  async register(dto: RegisterDto) {
    const { address, signature } = dto;
    if (!isValidAddress(address)) {
      throw new Error(INVALID_ADDRESS);
    }
    if (!isValidSignature(signature)) {
      throw new Error(INVALID_SIGNATURE);
    }

    const factory = this.contractsService.getFactory();
    const contractAddressStr = String((factory as any).target ?? (factory as any).address);

    // Verificar firma: mensaje = contractAddress (sin 0x) como bytes
    const messageHex = '0x' + contractAddressStr.toLowerCase().replace(/^0x/, '');
    let signerRecovered: string;
    try {
      signerRecovered = ethers.verifyMessage(ethers.getBytes(messageHex), signature);
    } catch (e) {
      throw new Error(INVALID_SIGNATURE);
    }

    if (signerRecovered.toLowerCase() !== address.toLowerCase()) {
      throw new Error(INVALID_SIGNATURE);
    }

    // Verificar si ya está autorizado/registrado
    const isReg = await factory.isRegistered(address);
    if (isReg) {
      throw new Error(ALREADY_AUTHORIZED);
    }

    try {
      const tx = await factory.authorize(address);
      const receipt = await tx.wait();
      if (receipt && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }
      return { message: OK };
    } catch (e) {
      const msg = (e as any)?.message ?? '';
      if (msg.includes('Ya se ha registrado')) {
        throw new Error(ALREADY_AUTHORIZED);
      }
      throw new Error(INTERNAL_ERROR);
    }
  }

  async authorized(address: string) {
    if (!isValidAddress(address)) {
      throw new Error(INVALID_ADDRESS);
    }
    const factory = this.contractsService.getFactory();
    const isAuth = await factory.isAuthorized(address);
    return { authorized: Boolean(isAuth), address };
  }

  async authorizeAccount(address: string) {
    if (!isValidAddress(address)) {
      throw new Error(INVALID_ADDRESS);
    }
    const factory = this.contractsService.getFactory();
    const owner = await factory.owner();
    const walletAddress = this.contractsService['web3Service'].getWallet().address; // Access from inside
    if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error(UNAUTHORIZED);
    }
    try {
      const tx = await factory.authorize(address);
      const receipt = await tx.wait();
      if (receipt && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }
      return { message: OK };
    } catch (e) {
      throw new Error(INTERNAL_ERROR);
    }
  }
} 