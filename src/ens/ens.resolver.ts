import { Injectable, OnModuleInit } from "@nestjs/common";
import { IResolverService } from "../resolver";
import { ResolveAddressRequest } from "src/resolver/types/resolve-address.request";
import { ResolveNameRequest } from "src/resolver/types/resolve-name.request";
import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

@Injectable()
export class EnsResolver implements IResolverService, OnModuleInit {
    
    private rpcClient: any;

    constructor() {}
    
    onModuleInit() {
        const rpc = process.env.RPC_URL;
        const ensChainId = process.env.ENS_CHAIN_ID;
        const rpcChain = ensChainId === "1" ? mainnet : sepolia
        this.rpcClient = createPublicClient({
            transport: http(rpc),
            chain: rpcChain
        })
    }

    resolve(name: string, resolveRequest: ResolveNameRequest) {
        throw new Error("Method not implemented.");
    }

    resolveAddress(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }
    
    resolveAddresses(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }

    
}