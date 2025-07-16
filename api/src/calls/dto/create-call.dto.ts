import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  callId!: string;

  @IsString()
  @IsNotEmpty()
  closingTime!: string; // ISO string

  @IsString()
  @IsNotEmpty()
  signature!: string;
} 