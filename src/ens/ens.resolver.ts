import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IResolverService } from '../resolver';
import {
  Address,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  encodeFunctionData,
  getContract,
  Hash,
  http,
} from 'viem';
import { base, mainnet } from 'viem/chains';
import { createEnsPublicClient } from '@ensdomains/ensjs';
import { InMemoryEnsCache } from './in-memory-ens.cache';
import { CacheType, EnsCache } from './interface/ens.cache';
import {
  AVATAR_TEXT,
  convertEVMChainIdToCoinType,
  DESCRIPTION_TEXT,
  DISCORD_TEXT,
  EMAIL_TEXT,
  extractOffchainLookupData,
  GITHUB_TEXT,
  HEADER_TEXT,
  isOffchainLookupErr,
  NAME_TEXT,
  TELEGRAM_TEXT,
  TWITTER_TEXT,
  URL_TEXT,
} from './ens.utils';
import {
  EnsAddressRecord,
  EnsProfile,
  EnsTextRecord,
  OffchainLookupParams,
} from './ens.types';
import {
  BulkReverseResolveResult,
  EnsAddressesResponse,
  EnsTextsResponse,
  ReverseResolveResult,
} from './dto/response.dto';
import {
  ResolveNameRequest,
  ResolveNameResponse,
} from 'src/resolver/types/resolve-name';
import { EthClients } from 'src/web3/eth.clients';
import { NameProtocol } from 'src/resolver/types/protocol';
import { Blockchains, getBlockchainByChainId } from './coins';
import { BulkReverseResolveRequest } from './dto/requests.dto';
import {
  BATCH_GATEWAY_ABI,
  UNIVERSAL_RESOLVER_ABI,
  UNIVERSAL_RESOLVER_ADDRESS,
} from 'src/web3/constants';
import { batch, getName } from '@ensdomains/ensjs/public';
import { getEnsName } from 'viem/actions';

const ETH_COIN = 60;

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

@Injectable()
export class EnsResolver implements IResolverService {
  private ensClient: ReturnType<typeof createEnsPublicClient>;
  private ensCache: EnsCache;

  constructor(
    private readonly _ensCache: InMemoryEnsCache,
    private readonly ethClients: EthClients,
  ) {
    const mainnetRpc = this.ethClients.getMainnetRpcUrl();
    this.ensClient = createEnsPublicClient({
      transport: http(mainnetRpc),
      chain: mainnet,
    });
    this.ensCache = this._ensCache;
  }

  public async reverseResolve(address: Address) {}

  public async bulkReverseResolve(
    request: BulkReverseResolveRequest,
  ): Promise<BulkReverseResolveResult> {
    const items: ReverseResolveResult[] = [];

    if (!request.addresses || request.addresses.length === 0) {
      return {
        result: items,
      };
    }

    if (request.addresses.length > 20) {
      throw new BadRequestException(
        `Maximum 20 addresses can be reverse resolved per request`,
      );
    }

    // Make sure there are no duplicates
    let addressMap: Record<Address, boolean> = {};
    request.addresses.forEach((addr) => {
      addressMap[addr.toLocaleLowerCase()] = true;
    });

    let result: ReverseResolveResult[] = [];
    let addressesToResolve = Object.keys(addressMap) as Address[];

    // We will add additional support for multichain reverse resolution
    // const coin_type = request.chain_id || convertEVMChainIdToCoinType(base.id)
    const coin_type = ETH_COIN;

    if (!request.noCache) {
      for (const a of request.addresses) {
        const cachedValue = this.ensCache.getPrimaryName(a, coin_type);
        if (cachedValue) {
          result.push(cachedValue);
          addressesToResolve = addressesToResolve.filter(
            (addr) =>
              addr.toLocaleLowerCase() !==
              cachedValue.address.toLocaleLowerCase(),
          );
        }
      }
    }

    // We only serve cashed
    if (addressesToResolve.length === 0) {
      return {
        result: result,
      };
    }

    const calls: any[] = [];
    const web3 = this.ethClients.getEthClient('mainnet');
    const offchainLookups: OffchainLookupParams[] = [];
    const callPromises: Promise<any>[] = [];

    const universalResolver = getContract({
      abi: UNIVERSAL_RESOLVER_ABI,
      address: UNIVERSAL_RESOLVER_ADDRESS,
      client: web3,
    });

    addressesToResolve.forEach((addr) => {
      callPromises.push(universalResolver.read.reverse([addr, BigInt(coin_type)]))
      // callPromises.push(getContract({ abi: UNIVERSAL_RESOLVER_ABI, address: UNIVERSAL_RESOLVER_ADDRESS, }))
    });

    const callRes = await Promise.all(callPromises);

    console.log(callRes);

    if (true) {
      return {
        result: items
      }
    }

    // Try to resolve onchain
    // calling universal resolver bulk multicall
    for (const a of addressesToResolve) {
      calls.push({
        functionName: 'reverse',
        args: [a, coin_type],
        address: UNIVERSAL_RESOLVER_ADDRESS,
        abi: UNIVERSAL_RESOLVER_ABI,
      });
    }
    const resolverResult = await web3.multicall({
      contracts: calls,
      allowFailure: true,
    });

    for (let i = 0; i < resolverResult.length; i++) {
      const current = resolverResult[i];

      if (current.result && current.status === 'success') {
        const data = current.result as [string, string, string];
        const [name] = data;

        const finalResult: ReverseResolveResult = {
          name: name,
          hasReverseRecord: name !== undefined && name.length > 0,
          address: addressesToResolve[i],
        };
        this.ensCache.setPrimaryName(finalResult, coin_type);
        result.push(finalResult);
      } else if (current.status === 'failure') {
        const err = current.error! as any;

        console.log(err.cause?.data, 'CAUSE');

        if (err.cause && isOffchainLookupErr(err.cause)) {
          const params = extractOffchainLookupData(err.cause);
          offchainLookups.push(params);
        } else {
          console.log('NO OFFCHAIN LOOKUP');
        }
      }
    }

    if (offchainLookups.length > 0) {
      console.log(offchainLookups, 'LOOKUPS');

      const batchGatewayRequests: any[] = offchainLookups.map((lookupData) => {
        return {
          sender: lookupData.sender,
          urls: lookupData.urls,
          data: lookupData.calldata,
        };
      });

      const batchResponse = await web3.readContract({
        functionName: 'query',
        abi: UNIVERSAL_RESOLVER_ABI,
        address: UNIVERSAL_RESOLVER_ADDRESS,
        args: [batchGatewayRequests],
      });

      console.log(batchResponse, 'RESPONSE!!');

      // const response = await web3.readContract({
      //   functionName: ""
      // })
    }

    return {
      result: result,
    };
  }

  public async clearCache(name: string, type: CacheType) {
    this.ensCache.clearCacheForName(name, [type]);
  }

  public async resolve(
    name: string,
    resolveRequest: ResolveNameRequest,
  ): Promise<ResolveNameResponse> {
    const chain_id =
      resolveRequest.chain_id !== undefined
        ? resolveRequest.chain_id
        : mainnet.id;
    const blockchain = getBlockchainByChainId(chain_id);

    if (!blockchain) {
      throw new BadRequestException(`Chain with id: ${chain_id} not supported`);
    }

    const coin_type = blockchain.coin_type;
    const cachedAddresses = this.ensCache.getAddresses(name, [coin_type]);

    let response: ResolveNameResponse = {
      protocol: NameProtocol.ENS,
      value: '',
      chain_id: blockchain.chain_id,
    };

    if (cachedAddresses) {
      response.value = cachedAddresses[0].address;
      return response;
    }

    const address = await this.ensClient.getAddressRecord({
      name: name,
      coin: coin_type,
    });

    if (address) {
      this.ensCache.setAddresses(
        name,
        [coin_type],
        [
          {
            coin: coin_type,
            address: address.value,
            name: address.name,
          },
        ],
      );
    } else {
      throw new NotFoundException();
    }

    response.value = address.value;
    return response;
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

  public async resolveText(name: string, key: string): Promise<string> {
    return '';
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

  public async getNameMetadata() {}

  private async getNameOwnership() {}

  private async getExpiry() {}

  private async getL2Ownership(name: string, chainId: number) {}

  private async isNamespaceL2Subname(name: string, resolver: string) {}
}
