import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterProposalDto {
  @IsString()
  @IsNotEmpty()
  callId!: string;

  @IsString()
  @IsNotEmpty()
  proposal!: string;
}

export class RegisterProposalWithSignatureDto {
  @IsString()
  @IsNotEmpty()
  callId!: string;

  @IsString()
  @IsNotEmpty()
  proposal!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsString()
  @IsNotEmpty()
  signer!: string;
} 