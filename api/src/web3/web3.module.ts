import { Module, Global } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {} 