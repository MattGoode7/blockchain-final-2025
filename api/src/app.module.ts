import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3Module } from './web3/web3.module';
import { ContractsModule } from './contracts/contracts.module';
import { CallsModule } from './calls/calls.module';
import { ProposalsModule } from './proposals/proposals.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { HealthController } from './health.controller';
import { contractsConfig } from './config/contracts.config';
import { ENSService } from './contracts/ens.service';
import { ENSController } from './contracts/ens.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      load: [contractsConfig],
    }),
    Web3Module,
    ContractsModule,
    CallsModule,
    ProposalsModule,
    AuthorizationModule,
  ],
  controllers: [HealthController, ENSController],
  providers: [ENSService],
})
export class AppModule {}
