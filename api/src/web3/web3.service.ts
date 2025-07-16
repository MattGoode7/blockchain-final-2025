import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider, HDNodeWallet } from 'ethers';

@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name);
  private provider: JsonRpcProvider;
  private wallet: HDNodeWallet;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.getOrThrow<string>('GANACHE_URL');
    const mnemonic = this.configService.getOrThrow<string>('MNEMONIC');

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = HDNodeWallet.fromPhrase(mnemonic).connect(this.provider);

    this.logger.log(`Web3Service inicializado. Address: ${this.wallet.address}`);
  }

  /**
   * Devuelve el proveedor JSON-RPC
   */
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Devuelve la wallet conectada al proveedor
   */
  getWallet(): HDNodeWallet {
    return this.wallet;
  }

  /**
   * Envía una transacción firmada y espera el recibo.
   */
  async sendSignedTransaction(txRequest: Parameters<HDNodeWallet['sendTransaction']>[0]) {
    const txResponse = await this.wallet.sendTransaction(txRequest);
    return txResponse.wait();
  }
} 