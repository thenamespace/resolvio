import { EnsAddressRecord, EnsTextRecord } from "../ens.types";

export interface EnsCache {
   getAddresses(name: string, coins: number[]): EnsAddressRecord[] | null;
   getTexts(name: string, texts: string[]): EnsTextRecord[] | null;
   getContenthash(name: string): string | null
   setAddresses(name: string, coins: number[], data: EnsAddressRecord[]);
   setTexts(name: string, keys: string[], data: EnsTextRecord[]);
   setContenthash(name: string, contenthash);
}