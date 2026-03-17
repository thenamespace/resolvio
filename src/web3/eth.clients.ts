import { Chain, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createEnsPublicClient } from '@ensdomains/ensjs';
import { AppProperties } from 'src/app-properties/app-properties';

export type EnsClient = ReturnType<typeof createEnsPublicClient>;

@Injectable()
export class EthClients implements OnModuleInit {
  private readonly logger = new Logger(EthClients.name);
  private ensjsClient: EnsClient;
  private _rpcCallCount = 0;

  constructor(private readonly appProperties: AppProperties) {}

  async onModuleInit() {
    const chain: Chain = this.appProperties.isTestnet ? sepolia : mainnet;

    const baseTransport = http(this.appProperties.rpcUrl);
    const self = this;

    // Wrap the transport to intercept every JSON-RPC request viem makes.
    // This fires once per RPC method call (e.g. eth_call, eth_getStorageAt),
    // before multicall batching collapses them — so the count reflects logical
    // calls, not necessarily individual HTTP round-trips.
    const countingTransport = (params: Parameters<typeof baseTransport>[0]) => {
      const transport = baseTransport(params);
      return {
        ...transport,
        request: async (args: Parameters<typeof transport.request>[0]) => {
          self._rpcCallCount++;
          self.logger.debug(`RPC call #${self._rpcCallCount}: ${args.method}`);
          return transport.request(args);
        },
      };
    };

    const _ensClient = createEnsPublicClient({
      // @ts-expect-error — countingTransport satisfies the Transport contract
      transport: countingTransport,
      // @ts-expect-error
      chain: chain,
      batch: { multicall: true },
    });
    this.ensjsClient = _ensClient;
  }

  public getEnsClient(): EnsClient {
    return this.ensjsClient;
  }

  /** Total JSON-RPC calls made since startup. */
  public get rpcCallCount(): number {
    return this._rpcCallCount;
  }

  /** Resets the counter — useful for per-request tracking in tests. */
  public resetRpcCallCount(): void {
    this._rpcCallCount = 0;
  }
}
