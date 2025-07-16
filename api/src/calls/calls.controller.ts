import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';

@Controller()
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('create')
  create(@Body() dto: CreateCallDto) {
    return this.callsService.create(dto);
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
} 