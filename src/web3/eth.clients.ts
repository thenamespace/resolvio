import { Chain, fallback, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createEnsPublicClient } from '@ensdomains/ensjs';
import { AppProperties } from 'src/app-properties/app-properties';

export type EnsClient = ReturnType<typeof createEnsPublicClient>;

@Injectable()
export class EthClients implements OnModuleInit {
  private readonly logger = new Logger(EthClients.name);
  private ensjsClient: EnsClient;

  constructor(private readonly appProperties: AppProperties) {}

  async onModuleInit() {
    const chain: Chain = this.appProperties.isTestnet ? sepolia : mainnet;
    const { mainRpcUrl, fallbackRpcUrls } = this.appProperties;

    // Main RPC is always tried first, fallbacks are used in order when it fails
    const rpcUrls = [mainRpcUrl || undefined, ...fallbackRpcUrls];
    const transport =
      rpcUrls.length === 1
        ? http(rpcUrls[0])
        : fallback(rpcUrls.map((url) => http(url)));

    this.logger.log(
      `Using main RPC with ${fallbackRpcUrls.length} fallback RPC(s)`,
    );

    const _ensClient = createEnsPublicClient({
      transport,
      // @ts-expect-error
      chain: chain,
      batch: { multicall: true },
    });
    this.ensjsClient = _ensClient;
  }

  public getEnsClient(): EnsClient {
    return this.ensjsClient;
  }
}
