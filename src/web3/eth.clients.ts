import { createPublicClient, http } from "viem";
import { EthChain } from "./eth.types";
import { base, mainnet, optimism } from "viem/chains";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { addEnsContracts, createEnsPublicClient, EnsPublicClient } from "@ensdomains/ensjs";

export type EthClient = ReturnType<typeof createPublicClient>

@Injectable()
export class EthClients {

    private clients: Partial<Record<EthChain, EthClient>> = {}
    private ensjsClient: EthClient

    constructor(private config: ConfigService) {

        const alchemy_token = this.config.get("ALCHEMY_TOKEN");
        const baseClient = createPublicClient({
            chain: base,
            transport: http(this.generateAlchemyUri(alchemy_token, "base-mainnet"))
        })

        const opClient = createPublicClient({
            chain: optimism,
            transport: http(this.generateAlchemyUri(alchemy_token, "opt-mainnet"))
        })

        const mainnetClient = createPublicClient({
            chain: mainnet,
            transport: http(this.generateAlchemyUri(alchemy_token, "eth-mainnet")),
            batch: {
                multicall: true
            }
        })

        this.clients = {
            mainnet: mainnetClient,
            // @ts-ignore
            optimism: opClient,
            // @ts-ignore
            base: baseClient
        }

        this.ensjsClient = createPublicClient({
            transport: http(this.getMainnetRpcUrl()),
            chain: addEnsContracts(mainnet),
            batch: {
                multicall: true,
            }
        })
    }

    public getEnsClient(): EthClient {
        return this.ensjsClient;
    }

    public getEthClient(chain: EthChain): EthClient {
        const client = this.clients[chain];
        if (!client) {
            throw new Error(`Client not found for chain: ${chain}`)
        }
        return client;
    }

    public getMainnetRpcUrl() {
        const alchemy_token = process.env.ALCHEMY_TOKEN || "";
        return this.generateAlchemyUri(alchemy_token, "eth-mainnet");
    }


    private generateAlchemyUri = (token: string, chain: string): string | undefined => {

        if (!token || !token.length) {
            return undefined;
        }

        return `https://${chain}.g.alchemy.com/v2/${token}`;
    }

}