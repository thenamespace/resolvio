import { Injectable, OnModuleInit } from "@nestjs/common";
import { IResolverService } from "../resolver";
import { ResolveAddressRequest } from "src/resolver/types/resolve-address.request";
import { ResolveNameRequest } from "src/resolver/types/resolve-name.request";
import { createPublicClient, http, PublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createEnsPublicClient, EnsPublicClient } from "@ensdomains/ensjs";
import { InMemoryEnsCache } from "./in-memory-ens.cache";
import { EnsCache } from "./interface/ens.cache";
import { ARBITRUM_COIN, AVATAR_TEXT, BASE_COIN, BTC_COIN, DESCRIPTION_TEXT, DISCORD_TEXT, EMAIL_TEXT, ETH_COIN, GITHUB_TEXT, HEADER_TEXT, NAME_TEXT, OP_COIN, SOL_COIN, TELEGRAM_TEXT, TWITTER_TEXT, URL_TEXT } from "./ens.utils";
import { EnsAddressRecord, EnsTextRecord } from "./ens.types";
import { EnsAddressesResponse, EnsTextsResponse } from "./dto/response.dto";

// Default addresses to resolve 
// if the addresses parameter is not provided
const DefaultCoins: number[] = [
    ETH_COIN,
    BTC_COIN,
    SOL_COIN,
    OP_COIN,
    BASE_COIN,
    ARBITRUM_COIN
]

// Default texts to resolve 
// if the texts parameter is not provided
const DefaultTexts: string[] = [
    DESCRIPTION_TEXT,
    AVATAR_TEXT,
    HEADER_TEXT,
    URL_TEXT,
    EMAIL_TEXT,
    TWITTER_TEXT,
    DISCORD_TEXT,
    GITHUB_TEXT,
    TELEGRAM_TEXT,
    NAME_TEXT
]

@Injectable()
export class EnsResolver implements IResolverService {

    private ensClient: ReturnType<typeof createEnsPublicClient>;
    private ensCache: EnsCache

    constructor(private readonly _ensCache: InMemoryEnsCache) {
        const rpc = process.env.RPC_URL;
        const is_testnet = process.env.is_testnet;
        const rpcChain = is_testnet ? sepolia : mainnet;
        this.ensClient = createEnsPublicClient({
            transport: http(rpc),
            chain: rpcChain,
        })
        this.ensCache = this._ensCache;
    }

    resolve(name: string, resolveRequest: ResolveNameRequest) {
        throw new Error("Method not implemented.");
    }

    resolveAddress(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }
    
    public async resolveTexts(name: string, keys: string[] = [], noCache: boolean = false): Promise<EnsTextsResponse> {

        const textsKeys = (keys && keys.length > 0) ? keys : DefaultTexts;
        const cachedTexts = this.ensCache.getTexts(name, textsKeys);
        if (cachedTexts && !noCache) {
            return {
                name: name,
                texts: cachedTexts
            }
        }

        const result = await this.ensClient.getRecords({
            name: name,
            texts: textsKeys
        })

        const texts: EnsTextRecord[] = [];
        result.texts.forEach(txt => {
            texts.push({
                key: txt.key,
                value: txt.value
            })
        })
        this.ensCache.setTexts(name, textsKeys, texts);
        
        return {
            texts: texts,
            name: name
        }
    }

    public async resolveAddresses(name: string, coins: number[] = [], noCache: boolean = false): Promise<EnsAddressesResponse> {

        const addressCoins = (coins && coins.length > 0) ? coins : DefaultCoins

        const cachedAddresses = this.ensCache.getAddresses(name, addressCoins)
        if (cachedAddresses && !noCache) {
            return {
                addresses: cachedAddresses,
                name
            }
        }
        const result = await this.ensClient.getRecords({
            name: name,
            coins: addressCoins
        })

        const addressRecords: EnsAddressRecord[] = [];
        result.coins.forEach(coin => {
            addressRecords.push({
                coin: coin.id,
                address: coin.value,
                name: coin.name
            })
        })
        this.ensCache.setAddresses(name, addressCoins, addressRecords)
        return {
            addresses: addressRecords,
            name
        }
    }


}