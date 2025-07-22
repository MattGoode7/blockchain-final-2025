import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegisterProposalDto, RegisterProposalWithSignatureDto } from './dto/register-proposal.dto';
import { ProposalsService } from './proposals.service';

@Controller()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post('register-proposal')
  registerProposal(@Body() dto: RegisterProposalDto) {
    return this.proposalsService.registerProposal(dto);
  }

  @Post('register-proposal-with-signature')
  registerProposalWithSignature(@Body() dto: RegisterProposalWithSignatureDto) {
    return this.proposalsService.registerProposalWithSignature(dto);
  }

  @Get('proposal-data/:callId/:proposal')
  getProposalData(@Param('callId') callId: string, @Param('proposal') proposal: string) {
    return this.proposalsService.getProposalData(callId, proposal);
  }
} 