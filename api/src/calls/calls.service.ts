import { Injectable } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { CreateCallDto } from './dto/create-call.dto';
import { ethers } from 'ethers';
import { validateAndConvertTime } from '../utils/time.utils';
import { isValidHexHash, isValidSignature, ZERO_ADDRESS } from '../utils/validation.utils';
import {
  INVALID_CALLID,
  INVALID_CLOSING_TIME,
  INVALID_PROPOSAL,
  INVALID_SIGNATURE,
  INTERNAL_ERROR,
  OK,
  CALLID_NOT_FOUND,
  ALREADY_CREATED,
} from '../utils/messages';

@Injectable()
export class CallsService {
  constructor(private readonly contractsService: ContractsService) {}

  async create(dto: CreateCallDto) {
    const { callId, closingTime, signature } = dto;

    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }

    if (!isValidSignature(signature)) {
      throw new Error(INVALID_SIGNATURE);
    }

    const { timestamp: closingTimeUnix, valid, error } = validateAndConvertTime(closingTime, true);
    if (!valid) {
      throw new Error(error ?? INVALID_CLOSING_TIME);
    }

    const factory = this.contractsService.getFactory();
    const contractAddressStr = String((factory as any).target ?? (factory as any).address);

    // Build message like python version: contractAddress + callId (sin 0x encabezado)
    const messageHex = '0x' + contractAddressStr.toLowerCase().replace(/^0x/, '') + callId.slice(2);
    let signerRecovered: string;
    try {
      signerRecovered = ethers.verifyMessage(ethers.getBytes(messageHex), signature);
    } catch (e) {
      throw new Error(INVALID_SIGNATURE);
    }

    // Revisar que la cuenta esté autorizada
    const isAuth: boolean = await factory.isAuthorized(signerRecovered);
    if (!isAuth) {
      throw new Error('No autorizado');
    }

    // Verificar que el llamado no exista
    const callData = await factory.calls(callId);
    if (callData[0] !== ZERO_ADDRESS) {
      throw new Error(ALREADY_CREATED);
    }

    // Enviar transacción createFor
    try {
      const tx = await factory.createFor(callId, closingTimeUnix, signerRecovered);
      const receipt = await tx.wait();
      if (receipt.status !== 1n && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }
      return { message: OK };
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('El llamado ya existe')) {
        throw new Error(ALREADY_CREATED);
      }
      if (msg.includes('El cierre de la convocatoria no puede estar en el pasado')) {
        throw new Error(INVALID_CLOSING_TIME);
      }
      if (msg.includes('No autorizado')) {
        throw new Error('No autorizado');
      }
      throw new Error(INTERNAL_ERROR);
    }
  }

  async listCalls() {
    const factory = this.contractsService.getFactory();
    const callIds = new Set<string>();

    const creatorsCountBn = await factory.creatorsCount();
    const creatorsCount = Number(creatorsCountBn);

    for (let i = 0; i < creatorsCount; i++) {
      const creator = await factory.creators(i);
      const createdCountBn = await factory.createdByCount(creator);
      const createdCount = Number(createdCountBn);
      for (let j = 0; j < createdCount; j++) {
        const callIdBytes: string = await factory.createdBy(creator, j);
        let callIdHex: string;
        if (!callIdBytes.startsWith('0x')) {
          callIdHex = '0x' + callIdBytes;
        } else {
          callIdHex = callIdBytes;
        }
        callIds.add(callIdHex);
      }
    }

    const calls = [] as Array<{ callId: string; creator: string; cfp: string; closingTime: string | null }>;
    for (const callId of callIds) {
      const call = await factory.calls(callId);
      const creatorAddr = call[0];
      const cfpAddr = call[1];
      let closingTimeIso: string | null = null;
      if (creatorAddr !== ZERO_ADDRESS) {
        try {
          const { contract: cfpContract } = await this.contractsService.getCfpById(callId);
          const closingTimeUnixBn = await cfpContract.closingTime();
          const closingTimeUnix = BigInt(closingTimeUnixBn).valueOf();
          closingTimeIso = new Date(Number(closingTimeUnix) * 1000).toISOString();
        } catch (e) {
          // ignore
        }
        calls.push({ callId, creator: creatorAddr, cfp: cfpAddr, closingTime: closingTimeIso });
      }
    }
    return calls;
  }

  async getCall(callId: string) {
    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }
    const factory = this.contractsService.getFactory();
    const call = await factory.calls(callId);
    if (call[0] === ZERO_ADDRESS) {
      throw new Error(CALLID_NOT_FOUND);
    }
    return { creator: call[0], cfp: call[1] };
  }

  async getClosingTime(callId: string) {
    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }
    try {
      const { contract, address } = await this.contractsService.getCfpById(callId);
      const closingTimeBn = await contract.closingTime();
      const closingTimeUnix = BigInt(closingTimeBn).valueOf();
      const closingTimeIso = new Date(Number(closingTimeUnix) * 1000).toISOString();
      return { closingTime: closingTimeIso, callId, cfpAddress: address };
    } catch (e: any) {
      if (e.message === CALLID_NOT_FOUND) {
        throw new Error(CALLID_NOT_FOUND);
      }
      throw new Error(INTERNAL_ERROR);
    }
  }

  async getContractAddress() {
    const factory = this.contractsService.getFactory();
    return { address: String((factory as any).target ?? (factory as any).address) };
  }

  async getContractOwner() {
    const factory = this.contractsService.getFactory();
    try {
      const owner = await factory.owner();
      return { address: owner };
    } catch {
      return { address: ZERO_ADDRESS };
    }
  }
} 