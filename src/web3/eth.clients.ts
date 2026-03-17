import { Chain, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createEnsPublicClient } from '@ensdomains/ensjs';
import { AppProperties } from 'src/app-properties/app-properties';

export type EnsClient = ReturnType<typeof createEnsPublicClient>;

@Injectable()
export class EthClients implements OnModuleInit {
  private ensjsClient: EnsClient;

  constructor(private readonly appProperties: AppProperties) {}

  async onModuleInit() {
    const chain: Chain = this.appProperties.isTestnet ? sepolia : mainnet;
    
    const _ensClient = createEnsPublicClient({
      transport: http(this.appProperties.rpcUrl),
      //@ts-ignore
      chain: chain,
      batch: {
        multicall: true,
      },
    });
    this.ensjsClient = _ensClient;
  }

  public getEnsClient(): EnsClient {
    return this.ensjsClient;
  }
}
