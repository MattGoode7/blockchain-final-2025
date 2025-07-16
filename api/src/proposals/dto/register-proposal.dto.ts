import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterProposalDto {
  @IsString()
  @IsNotEmpty()
  callId!: string;

  @IsString()
  @IsNotEmpty()
  proposal!: string;
} 