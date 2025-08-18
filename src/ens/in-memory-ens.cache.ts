import { Injectable } from "@nestjs/common";
import { EnsCache } from "./interface/ens.cache";
import { EnsAddressRecord, EnsProfile, EnsTextRecord } from "./ens.types";

type CacheWrapper<T> = {
    data: T
    expiration: number
}

@Injectable()
export class InMemoryEnsCache implements EnsCache {

    // use 30 minutes cache expiry
    // TODO: move this to env
    static CACHE_EXPIRATION = 30 * 60 * 1000;

    private addressesCache: Record<string, CacheWrapper<EnsAddressRecord[]>> = {}
    private textsCache: Record<string, CacheWrapper<EnsTextRecord[]>> = {}
    private contentCache: Record<string, CacheWrapper<string>> = {}
    private profileCache: Record<string, CacheWrapper<EnsProfile>> = {}


    public setProfile(name: string, profile: EnsProfile) {

        const now = new Date().getTime();
        this.profileCache[name] = {
            expiration: now + InMemoryEnsCache.CACHE_EXPIRATION,
            data: profile
        }
    }

    public getProfile(name: string): EnsProfile | null {
        return this.getCacheOrNull(name, this.profileCache);
    }

    public setAddresses(name: string, coins: number[], addresses: EnsAddressRecord[]) {

        const addrKey = this.addrCacheKey(name, coins);
        const now = new Date().getTime();
        this.addressesCache[addrKey] = {
            expiration: now + InMemoryEnsCache.CACHE_EXPIRATION,
            data: addresses
        }
    }

    public getAddresses(name: string, coins: number[]): EnsAddressRecord[] | null {
        const key = this.addrCacheKey(name, coins);
        return this.getCacheOrNull(key, this.addressesCache);
    }

    public setTexts(name: string, texts: string[], data: EnsTextRecord[]): void {
        const key = this.textCacheKey(name, texts);
        const now = new Date().getTime();
        this.textsCache[key] = {
            expiration: now + InMemoryEnsCache.CACHE_EXPIRATION,
            data: data
        }
    }

    public getTexts(name: string, texts: string[]): EnsTextRecord[] | null {
        const key = this.textCacheKey(name, texts);
        return this.getCacheOrNull(key, this.textsCache);
    }

    public getContenthash(name: string): string | null {
        return this.getCacheOrNull(name, this.contentCache);
    }

    public setContenthash(name: string, contenthash: string) {
        const now = new Date().getTime();
        this.contentCache[name] = {
            expiration: now + InMemoryEnsCache.CACHE_EXPIRATION,
            data: contenthash
        }
    }

    private addrCacheKey(name: string, coins: number[]): string {
        let base_key = name;
        coins.forEach(coin => {
            base_key += `${coin}`
        })
        return base_key;
    }

    private textCacheKey(name: string, keys: string[]): string {
        let base_key = name;
        keys.forEach(key => {
            base_key += key;
        })
        return base_key;
    }

    private isExpiredCache(cache: CacheWrapper<any>): boolean {
        const now = new Date().getTime();
        return now > cache.expiration;
    }

    private getCacheOrNull(key: string, cache: Record<string, CacheWrapper<any>>): any | null {
        const currentCache = cache[key];
        if (currentCache && currentCache.data && !this.isExpiredCache(currentCache)) {
            return currentCache.data;
        }
        return null;
    }
}