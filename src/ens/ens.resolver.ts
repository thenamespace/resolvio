import { Injectable } from "@nestjs/common";
import { IResolverService } from "../resolver";
import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createEnsPublicClient } from "@ensdomains/ensjs";
import { InMemoryEnsCache } from "./in-memory-ens.cache";
import { CacheType, EnsCache } from "./interface/ens.cache";
import { ARBITRUM_COIN, AVATAR_TEXT, BASE_COIN, BTC_COIN, DESCRIPTION_TEXT, DISCORD_TEXT, EMAIL_TEXT, ETH_COIN, GITHUB_TEXT, HEADER_TEXT, NAME_TEXT, OP_COIN, SOL_COIN, TELEGRAM_TEXT, TWITTER_TEXT, URL_TEXT } from "./ens.utils";
import { EnsAddressRecord, EnsProfile, EnsTextRecord } from "./ens.types";
import { EnsAddressesResponse, EnsTextsResponse } from "./dto/response.dto";
import { ResolveNameRequest } from "src/resolver/types/resolve-name";

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
    private web3Client: ReturnType<typeof createPublicClient>;

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

    public async clearCache(name: string, type: CacheType) {
        this.ensCache.clearCacheForName(name, [type]);
    }

    public async resolve(name: string, resolveRequest: ResolveNameRequest) {
        const cachedAddresses = this.ensCache.getAddresses(name, [resolveRequest.chainId || ETH_COIN]);

        if (cachedAddresses) {

        }


        throw new Error("Method not implemented.");
    }

    public async resolveAddress(name: string, coin: number): Promise<string> {
        
        return "";
    }

    public async resolveContenthash(name: string) {
        
        const cachedValue = this.ensCache.getContenthash(name);
        return cachedValue;
    }

    public async resolveProfile(name: string, noCache: boolean = false): Promise<EnsProfile> {

        const cacheData = this.ensCache.getProfile(name);

        if (cacheData && !noCache) {
            return cacheData;
        }

        const result = await this.ensClient.getRecords({
            coins: DefaultCoins,
            texts: DefaultTexts,
            contentHash: true,
            name: name
        })

        let contenthash

        if (result.contentHash) {
            contenthash = `${result.contentHash.protocolType}://${result.contentHash.decoded}`
        }

        const profile: EnsProfile = {
            name: name,
            addresses: (result && result.coins && result.coins.length) ? result.coins.map(coin => {
                return { address: coin.value, coin: coin.id, name: coin.name}
            }) : [],
            texts: (result && result.texts) ? result.texts : [],
            contenthash: contenthash,
            resolver: result.resolverAddress
        }

        this.ensCache.setProfile(name, profile);
        return profile;
    }

    public async resolveText(name: string, key: string): Promise<string> {
        return "";
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

    public async getNameMetadata() {

    }

    private async getNameOwnership() {

    }

    private async getExpiry() {

    }

    private async getL2Ownership(name: string, chainId: number) {

    }

    private async isNamespaceL2Subname(name: string, resolver: string) {

    }
}