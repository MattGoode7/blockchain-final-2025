import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { RegisterProposalDto, RegisterProposalWithSignatureDto } from './dto/register-proposal.dto';
import { isValidHexHash, ZERO_ADDRESS } from '../utils/validation.utils';
import {
  INVALID_CALLID,
  INVALID_PROPOSAL,
  ALREADY_REGISTERED,
  CALLID_NOT_FOUND,
  INTERNAL_ERROR,
  OK,
  INVALID_CLOSING_TIME,
  PROPOSAL_NOT_FOUND,
} from '../utils/messages';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);
  constructor(private readonly contractsService: ContractsService) {}

  async registerProposal(dto: RegisterProposalDto) {
    const { callId, proposal } = dto;

    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }
    if (!isValidHexHash(proposal, 64)) {
      throw new Error(INVALID_PROPOSAL);
    }

    // comprobar call existe y obtener contrato CFP
    let cfpContract;
    try {
      ({ contract: cfpContract } = await this.contractsService.getCfpById(callId));
    } catch (e: any) {
      if (e.message === CALLID_NOT_FOUND) {
        throw new Error(CALLID_NOT_FOUND);
      }
      throw new Error(INTERNAL_ERROR);
    }

    // verificar si convocatoria está cerrada
    try {
      const closingTimeBn = await cfpContract.closingTime();
      const closingTime = Number(closingTimeBn);
      const now = Math.floor(Date.now() / 1000);
      if (closingTime <= now) {
        throw new HttpException(INVALID_CLOSING_TIME, HttpStatus.FORBIDDEN);
      }
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      // Si falla llamada al contrato se considera error interno
      this.logger.error('No se pudo obtener closingTime', e);
      throw new Error(INTERNAL_ERROR);
    }

    // verificar si propuesta ya registrada
    const proposalData = await cfpContract.proposalData(proposal);
    if (proposalData[0] !== ZERO_ADDRESS) {
      throw new HttpException(ALREADY_REGISTERED, HttpStatus.FORBIDDEN);
    }

    // enviar tx registerProposal
    try {
      const tx = await cfpContract.registerProposal(proposal);
      const receipt = await tx.wait();
      if (receipt.status !== 1n && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }
      return { message: OK };
    } catch (e: any) {
      this.logger.error('Error al registrar propuesta', e);
      const msg = e?.message ?? '';
      if (msg.includes('Convocatoria cerrada')) {
        throw new HttpException(INVALID_CLOSING_TIME, HttpStatus.FORBIDDEN);
      }
      if (msg.includes('La propuesta ya ha sido registrada')) {
        throw new HttpException(ALREADY_REGISTERED, HttpStatus.FORBIDDEN);
      }
      throw new Error(INTERNAL_ERROR);
    }
  }

  async registerProposalWithSignature(dto: RegisterProposalWithSignatureDto) {
    const { callId, proposal, signature, signer } = dto;

    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }
    if (!isValidHexHash(proposal, 64)) {
      throw new Error(INVALID_PROPOSAL);
    }

    // comprobar call existe y obtener contrato CFP
    let cfpContract;
    try {
      ({ contract: cfpContract } = await this.contractsService.getCfpById(callId));
    } catch (e: any) {
      if (e.message === CALLID_NOT_FOUND) {
        throw new Error(CALLID_NOT_FOUND);
      }
      throw new Error(INTERNAL_ERROR);
    }

    // verificar si convocatoria está cerrada
    try {
      const closingTimeBn = await cfpContract.closingTime();
      const closingTime = Number(closingTimeBn);
      const now = Math.floor(Date.now() / 1000);
      if (closingTime <= now) {
        throw new HttpException(INVALID_CLOSING_TIME, HttpStatus.FORBIDDEN);
      }
    } catch (e: any) {
      if (e instanceof HttpException) {
        throw e;
      }
      // Si falla llamada al contrato se considera error interno
      this.logger.error('No se pudo obtener closingTime', e);
      throw new Error(INTERNAL_ERROR);
    }

    // verificar si propuesta ya registrada
    const proposalData = await cfpContract.proposalData(proposal);
    if (proposalData[0] !== ZERO_ADDRESS) {
      throw new HttpException(ALREADY_REGISTERED, HttpStatus.FORBIDDEN);
    }

    // enviar tx registerProposal (cualquiera puede llamarlo)
    try {
      const tx = await cfpContract.registerProposal(proposal);
      const receipt = await tx.wait();
      if (receipt.status !== 1n && receipt.status !== 1) {
        throw new Error(INTERNAL_ERROR);
      }
      return { message: OK };
    } catch (e: any) {
      this.logger.error('Error al registrar propuesta con firma', e);
      const msg = e?.message ?? '';
      if (msg.includes('Convocatoria cerrada')) {
        throw new HttpException(INVALID_CLOSING_TIME, HttpStatus.FORBIDDEN);
      }
      if (msg.includes('La propuesta ya ha sido registrada')) {
        throw new HttpException(ALREADY_REGISTERED, HttpStatus.FORBIDDEN);
      }
      throw new Error(INTERNAL_ERROR);
    }
  }

  async getProposalData(callId: string, proposal: string) {
    if (!isValidHexHash(callId, 64)) {
      throw new Error(INVALID_CALLID);
    }
    if (!isValidHexHash(proposal, 64)) {
      throw new Error(INVALID_PROPOSAL);
    }

    let cfpContract;
    try {
      ({ contract: cfpContract } = await this.contractsService.getCfpById(callId));
    } catch (e: any) {
      if (e.message === CALLID_NOT_FOUND) {
        throw new Error(CALLID_NOT_FOUND);
      }
      throw new Error(INTERNAL_ERROR);
    }

    const data = await cfpContract.proposalData(proposal);
    const sender = data[0] as string;
    if (sender === ZERO_ADDRESS) {
      throw new HttpException(PROPOSAL_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const blockNumberBn = data[1];
    const timestampBn = data[2];
    const timestampUnix = BigInt(timestampBn).valueOf();

    return {
      sender,
      blockNumber: blockNumberBn.toString(),
      timestamp: new Date(Number(timestampUnix) * 1000).toISOString(),
    };
  }
} 