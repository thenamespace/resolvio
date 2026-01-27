import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EthClients } from 'src/web3/eth.clients';
import { BulkReverseResolveRequest } from './dto/requests.dto';
import { BulkReverseResolveResult } from './dto/response.dto';
import {  mainnet } from 'viem/chains';
import { Address, toCoinType } from 'viem';
import { SUPPORTED_REVERSE_REGISTRAR_CHAINS } from 'src/web3/constants';

const cache_expiry_millis = 30 * 60 * 1000;

@Injectable()
export class EnsReverseResolver {
  private readonly logger = new Logger(EnsReverseResolver.name);
  private readonly cache: Map<string, { value: string; exp: number }> =
    new Map();
  private readonly cacheSet: Map<string,boolean> = new Map();

  constructor(private readonly web3: EthClients) {}

  public async clearCache(address: Address[]) {
    const addrSet: Set<Address> = new Set(address);
    const addressesToClear: Set<Address> = new Set();

    for (const addr of addrSet) {
        const lc = addr.toLocaleLowerCase();
        if (this.cacheSet.has(lc)) {
            addressesToClear.add(lc as Address);
        }
    }

    const keysToDelete: string[] = [];
    for (const [key, value] of this.cache.entries()) {
        const keyAddress = key.split("-")[0] as Address;
        if (addressesToClear.has(keyAddress)) {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => {
        this.cache.delete(key);
    })
  }

  public async resolve(
    request: BulkReverseResolveRequest,
  ): Promise<BulkReverseResolveResult> {

    if (request.addresses.length === 0) {
      return {
        result: [],
      };
    }

    if (request.addresses.length > 20) {
      throw new BadRequestException(
        `Endpoint supports up to 20 address in a batch`,
      );
    }

    if (request.chain_id) {
      this.ensureSupportedReverseChainId(request.chain_id);
    }

    const coin_type = toCoinType(request.chain_id || mainnet.id);
    let finalResult: BulkReverseResolveResult = {
      result: [],
    };

    // lets ensure no duplicated addresses
    const addressSet = new Set(
      request.addresses.map((addr) => addr.toLocaleLowerCase()),
    );
    const promises: Promise<{ address: Address; name?: string | null }>[] = [];

    for (const addr of addressSet) {
      const _address = addr as Address;
      const cachedName = this.getCacheResult(_address, coin_type);
      if (cachedName !== null && request.noCache !== true) {
        finalResult.result.push({
          address: _address,
          hasReverseRecord: true,
          name: cachedName || undefined,
        });
      } else {
        promises.push(this.resolveNamePromise(_address));
      }
    }

    if (promises.length > 0) {
      const resolvedNames = await Promise.all(promises);
      for (let resolvedName of resolvedNames) {
        finalResult.result.push({
            address: resolvedName.address,
            hasReverseRecord: resolvedName.name !== null,
            name: resolvedName.name || undefined
        })

        if (resolvedName.name) {
            this.setCacheResult(resolvedName.address, coin_type, resolvedName.name);
        }
      }
    }

    const end = new Date().getTime();

    return finalResult;
  }

  private async resolveNamePromise(
    addr: Address,
  ): Promise<{ address: Address; name: string | null }> {
    const result = await this.web3.getEnsClient().getEnsName({ address: addr });
    return {
      address: addr,
      name: result,
    };
  }

  private getCacheResult(addr: Address, coinType: bigint): string | null {
    const now = new Date().getTime();
    const key = this.cacheKey(addr, coinType);

    if (!this.cache.has(key)) {
      return null;
    }

    const cachedItem = this.cache.get(key)!;

    if (cachedItem.exp > now) {
      return cachedItem.value;
    } else {
      this.cache.delete(key);
      this.cacheSet.delete(addr);
    }
    return null;
  }

  private setCacheResult(addr: Address, coinType: bigint, name: string) {
    this.cache.set(this.cacheKey(addr, coinType), {
      value: name,
      exp: new Date().getTime() + cache_expiry_millis,
    });
    this.cacheSet.set(addr, true);
  }

  private cacheKey(addr: Address, coinType: bigint) {
    return `${addr.toLocaleLowerCase()}-${coinType.toString()}`;
  }

  private ensureSupportedReverseChainId = (chain_id: number) => {
      if (!SUPPORTED_REVERSE_REGISTRAR_CHAINS.includes(chain_id)) {
        throw new BadRequestException(
          `Unsupported reverse chain id: ${chain_id}, supported: ${SUPPORTED_REVERSE_REGISTRAR_CHAINS}`,
        );
      }
    };

  @Cron('0 * * * *') // Run every hour at minute 0
  public clearExpiredCache() {
    const now = new Date().getTime();
    const keysToDelete: string[] = [];

    this.logger.log("Clearing expired cache, timestamp:" + new Date());

    for (const [key, cachedItem] of this.cache.entries()) {
      if (cachedItem.exp <= now) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      const addr = key.split("-")[0];
      this.cacheSet.delete(addr);
    }

    if (keysToDelete.length > 0) {
      console.log(`Cleared ${keysToDelete.length} expired cache entries`);
    }
  }
}
