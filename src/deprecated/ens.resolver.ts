import { Injectable, NotFoundException } from '@nestjs/common';
import { createEnsPublicClient } from '@ensdomains/ensjs';
import { InMemoryEnsCache } from './in-memory-ens.cache';
import { CacheType, EnsCache } from './interface/ens.cache';
import {
  AVATAR_TEXT,
  DESCRIPTION_TEXT,
  DISCORD_TEXT,
  EMAIL_TEXT,
  GITHUB_TEXT,
  HEADER_TEXT,
  NAME_TEXT,
  TELEGRAM_TEXT,
  TWITTER_TEXT,
  URL_TEXT,
} from './ens.utils';
import { EnsAddressRecord, EnsProfile, EnsTextRecord } from '../ens/ens.types';
import { EnsAddressesResponse, EnsTextsResponse } from './dto/ens-v1.response';
import { EthClients } from 'src/web3/eth.clients';
import { Blockchains } from './coins';

// Default addresses to resolve
// if the addresses parameter is not provided
const DefaultCoins: number[] = [
  Blockchains.eth.coin_type,
  Blockchains.btc.coin_type,
  Blockchains.sol.coin_type,
  Blockchains.op.coin_type,
  Blockchains.base.coin_type,
  Blockchains.arb.coin_type,
];

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
  NAME_TEXT,
];

/** @deprecated Use EnsForwardResolver (v2) instead. */
@Injectable()
export class EnsResolver {
  private ensClient: ReturnType<typeof createEnsPublicClient>;
  private ensCache: EnsCache;

  constructor(
    private readonly _ensCache: InMemoryEnsCache,
    private readonly ethClients: EthClients,
  ) {
    this.ensClient = this.ethClients.getEnsClient();
    this.ensCache = this._ensCache;
  }

  public clearCache(name: string, type: CacheType) {
    this.ensCache.clearCacheForName(name, [type]);
  }

  public async resolveContenthash(name: string) {
    const cachedValue = this.ensCache.getContenthash(name);

    if (cachedValue) {
      return {
        contenthash: cachedValue,
      };
    }

    const contenthash = await this.ensClient.getContentHashRecord({
      name: name,
    });

    if (!contenthash) {
      throw new NotFoundException();
    }

    const uri = `${contenthash.protocolType}://${contenthash.decoded}`;
    this.ensCache.setContenthash(name, uri);

    return {
      contenthash: uri,
    };
  }

  public async resolveProfile(
    name: string,
    noCache: boolean,
  ): Promise<EnsProfile> {
    const cacheData = this.ensCache.getProfile(name);

    if (cacheData && !noCache) {
      return cacheData;
    }

    const result = await this.ensClient.getRecords({
      coins: DefaultCoins,
      texts: DefaultTexts,
      contentHash: true,
      name: name,
    });

    let contenthash;

    if (result.contentHash) {
      contenthash = `${result.contentHash.protocolType}://${result.contentHash.decoded}`;
    }

    const profile: EnsProfile = {
      name: name,
      addresses:
        result && result.coins && result.coins.length
          ? result.coins.map((coin) => {
              return { address: coin.value, coin: coin.id, name: coin.name };
            })
          : [],
      texts: result && result.texts ? result.texts : [],
      contenthash: contenthash,
      resolver: result.resolverAddress,
    };

    this.ensCache.setProfile(name, profile);
    return profile;
  }

  public async resolveTexts(
    name: string,
    keys: string[] = [],
    noCache: boolean = false,
  ): Promise<EnsTextsResponse> {
    const textsKeys = keys && keys.length > 0 ? keys : DefaultTexts;
    const cachedTexts = this.ensCache.getTexts(name, textsKeys);
    if (cachedTexts && !noCache) {
      return {
        name: name,
        texts: cachedTexts,
      };
    }

    const result = await this.ensClient.getRecords({
      name: name,
      texts: textsKeys,
    });

    const texts: EnsTextRecord[] = [];
    result.texts.forEach((txt) => {
      texts.push({
        key: txt.key,
        value: txt.value,
      });
    });
    this.ensCache.setTexts(name, textsKeys, texts);

    return {
      texts: texts,
      name: name,
    };
  }

  public async resolveAddresses(
    name: string,
    coins: number[] = [],
    noCache: boolean = false,
  ): Promise<EnsAddressesResponse> {
    const addressCoins = coins && coins.length > 0 ? coins : DefaultCoins;

    const cachedAddresses = this.ensCache.getAddresses(name, addressCoins);
    if (cachedAddresses && !noCache) {
      return {
        addresses: cachedAddresses,
        name,
      };
    }
    const result = await this.ensClient.getRecords({
      name: name,
      coins: addressCoins,
    });

    const addressRecords: EnsAddressRecord[] = [];
    result.coins.forEach((coin) => {
      addressRecords.push({
        coin: coin.id,
        address: coin.value,
        name: coin.name,
      });
    });
    this.ensCache.setAddresses(name, addressCoins, addressRecords);
    return {
      addresses: addressRecords,
      name,
    };
  }
}
