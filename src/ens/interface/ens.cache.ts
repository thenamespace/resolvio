import { Address } from "viem";
import { EnsAddressRecord, EnsProfile, EnsTextRecord } from "../ens.types";
import { ReverseResolveResult } from "../dto/response.dto";

export enum CacheType {
   ADDRESS = "address",
   TEXT = "text",
   CONTENTHASH = "contenthash",
   ALL = "all"
}

export interface EnsCache {
   getAddresses(name: string, coins: number[]): EnsAddressRecord[] | null;
   getTexts(name: string, texts: string[]): EnsTextRecord[] | null;
   getContenthash(name: string): string | null
   setAddresses(name: string, coins: number[], data: EnsAddressRecord[]);
   setTexts(name: string, keys: string[], data: EnsTextRecord[]);
   setContenthash(name: string, contenthash);
   setProfile(name: string, profile: EnsProfile)
   getProfile(name: string);
   clearCacheForName(name: string, types: CacheType[]);
   getPrimaryName(address: Address, chain_id: number): ReverseResolveResult | null;
   setPrimaryName(result: ReverseResolveResult, chain_id: number);
}