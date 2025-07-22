import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from '../web3/web3.module';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Global()
@Module({
  imports: [ConfigModule, Web3Module],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {} 