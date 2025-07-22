import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';

interface CreateCallWithENSDto {
  callId: string;
  closingTime: string;
  signature: string;
  callName: string;
  description?: string;
}

@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('create')
  create(@Body() dto: CreateCallDto) {
    return this.callsService.create(dto);
  }

  @Post('create-with-ens')
  createWithENS(@Body() dto: CreateCallWithENSDto) {
    return this.callsService.createWithENS(dto);
  }

  @Get('calls')
  listCalls() {
    return this.callsService.listCalls();
  }

  @Get('calls/:callId')
  getCall(@Param('callId') callId: string) {
    return this.callsService.getCall(callId);
  }

  @Get('closing-time/:callId')
  getClosingTime(@Param('callId') callId: string) {
    return this.callsService.getClosingTime(callId);
  }

  @Get('contract-address')
  getContractAddress() {
    return this.callsService.getContractAddress();
  }

  @Get('contract-owner')
  getContractOwner() {
    return this.callsService.getContractOwner();
  }

  @Get('proposal-counts')
  getProposalCounts(@Query('callIds') callIds: string) {
    const callIdsArray = callIds.split(',').filter(id => id.trim());
    return this.callsService.getProposalCounts(callIdsArray);
  }
} 