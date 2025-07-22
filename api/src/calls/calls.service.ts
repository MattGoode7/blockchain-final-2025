import { Injectable } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { CreateCallDto } from './dto/create-call.dto';
import { ethers } from 'ethers';
import { validateAndConvertTime } from '../utils/time.utils';
import { isValidHexHash, isValidSignature, ZERO_ADDRESS } from '../utils/validation.utils';
import {
  INVALID_CALLID,
  INVALID_CLOSING_TIME,
  INVALID_SIGNATURE,
  INTERNAL_ERROR,
  OK,
  CALLID_NOT_FOUND,
  ALREADY_CREATED,
} from '../utils/messages';

interface CreateCallWithENSDto {
  callId: string;
  closingTime: string;
  signature: string;
  callName: string;
  description?: string;
}

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
    if (callData.creator !== ZERO_ADDRESS) {
      throw new Error(ALREADY_CREATED);
    }

    // Enviar transacción createFor
    try {
      const tx = await factory.createFor(callId, closingTimeUnix, signerRecovered);
      const receipt = await tx.wait();
      if (receipt && receipt.status !== 1) {
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

  async createWithENS(dto: CreateCallWithENSDto) {
    const { callId, closingTime, signature, callName, description } = dto;

    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }

    if (!isValidSignature(signature)) {
      throw new Error(INVALID_SIGNATURE);
    }

    if (!callName || callName.trim() === '') {
      throw new Error('El nombre del llamado es requerido');
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
    if (callData.creator !== ZERO_ADDRESS) {
      throw new Error(ALREADY_CREATED);
    }

    try {
      // Paso 1: Crear el llamado usando createForWithENS
      const tx = await factory.createForWithENS(callId, closingTimeUnix, signerRecovered);
      const receipt = await tx.wait();
      
      if (receipt && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }

      // Paso 2: Obtener la dirección del contrato CFP creado
      const callDataAfter = await factory.calls(callId);
      const cfpAddress = callDataAfter.cfp;

      // Paso 3: Registrar el nombre ENS
      const ensService = this.contractsService.getENSService();
      if (!ensService) {
        throw new Error('Servicio ENS no disponible');
      }

      const ensReceipt = await ensService.registerCallName(callName, cfpAddress, description);

      return { 
        message: OK,
        cfpAddress,
        ensName: `${callName}.llamados.cfp`,
        ensReceipt: ensReceipt.hash
      };
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
      if (msg.includes('El nombre del llamado ya está registrado')) {
        throw new Error('El nombre del llamado ya está registrado');
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

    const calls = [] as Array<{ callId: string; creator: string; cfp: string; closingTime: string | null; ensName?: string; description?: string }>;
    for (const callId of callIds) {
      const call = await factory.calls(callId);
      const creatorAddr = call.creator;
      const cfpAddr = call.cfp;
      let closingTimeIso: string | null = null;
      if (creatorAddr !== ZERO_ADDRESS) {
        closingTimeIso = await this.getClosingTimeForCall(callId);
        
        // Resolver nombre ENS del llamado
        let ensName: string | undefined;
        let description: string | undefined;
        try {
          const ensService = this.contractsService.getENSService();
          if (ensService) {
            const resolvedName = await ensService.resolveAddress(cfpAddr);
            ensName = resolvedName || undefined;
            
            // Si se resolvió el nombre ENS, obtener la descripción
            if (ensName) {
              const nameInfo = await ensService.getNameInfo(ensName);
              description = nameInfo?.description;
            }
          }
        } catch (e) {
          // Si no se puede resolver el nombre ENS, continuar sin él
          console.log(`No se pudo resolver nombre ENS para llamado ${callId}:`, e);
        }
        
        calls.push({ callId, creator: creatorAddr, cfp: cfpAddr, closingTime: closingTimeIso, ensName, description });
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
    if (call.creator === ZERO_ADDRESS) {
      throw new Error(CALLID_NOT_FOUND);
    }
    return { creator: call.creator, cfp: call.cfp };
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

  private async getClosingTimeForCall(callId: string): Promise<string | null> {
    try {
      const { contract: cfpContract } = await this.contractsService.getCfpById(callId);
      const closingTimeUnixBn = await cfpContract.closingTime();
      const closingTimeUnix = BigInt(closingTimeUnixBn).valueOf();
      return new Date(Number(closingTimeUnix) * 1000).toISOString();
    } catch (error) {
      // Log del error para debugging pero no fallar la operación
      console.warn(`No se pudo obtener closing time para llamado ${callId}:`, error);
      return null;
    }
  }

  async getProposalCounts(callIds: string[]) {
    const counts: { [callId: string]: number } = {};
    
    for (const callId of callIds) {
      try {
        const { contract: cfpContract } = await this.contractsService.getCfpById(callId);
        const countBn = await cfpContract.proposalCount();
        counts[callId] = Number(countBn);
      } catch (e) {
        // Si no se puede obtener el conteo, asignar 0
        counts[callId] = 0;
      }
    }
    
    return counts;
  }
} 