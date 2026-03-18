import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { EnsResolver } from './ens.resolver';
import {
  BulkReverseResolveRequest,
  DeleteReverseCacheRequest,
  EnsAddressesRequest,
  EnsNameRequest,
  EnsTextsRequest,
  NoCache,
} from '../ens/dto';
import { CacheType } from './interface/ens.cache';
import { type Address } from 'viem';
import { isEthereumAddress } from 'class-validator';
import { EnsReverseResolver } from './ens-reverse.resolver';

/**
 * @deprecated Use /ens/v2 endpoints instead.
 * Kept for backwards compatibility — will be removed in a future release.
 */
@ApiExcludeController()
@Controller('/ens/v1')
export class EnsForwardResolutionController {
  constructor(private readonly ensResolver: EnsResolver) {}

  @Get('/profile/:name')
  public async getEnsProfile(
    @Param() name: EnsNameRequest,
    @Query() cache: NoCache,
  ) {
    return this.ensResolver.resolveProfile(name.name, cache.noCache || false);
  }

  @Get('/addresses/:name')
  public getEnsAddresses(
    @Param() name: EnsNameRequest,
    @Query() addressRequest: EnsAddressesRequest,
  ) {
    return this.ensResolver.resolveAddresses(
      name.name,
      addressRequest.coins,
      addressRequest.noCache,
    );
  }

  @Get('/texts/:name')
  public getEnsTexts(
    @Param() name: EnsNameRequest,
    @Query() textsRequest: EnsTextsRequest,
  ) {
    return this.ensResolver.resolveTexts(
      name.name,
      textsRequest.keys,
      textsRequest.noCache,
    );
  }

  @Get('/contenthash/:name')
  public async getEnsContenthash(@Param() name: EnsNameRequest) {
    return this.ensResolver.resolveContenthash(name.name);
  }

  @Delete('/cache/:name')
  public clearCache(@Param() name: EnsNameRequest) {
    return this.ensResolver.clearCache(name.name, CacheType.ALL);
  }
}

/**
 * @deprecated Use /ens/v2 endpoints instead.
 * Kept for backwards compatibility — will be removed in a future release.
 */
@ApiExcludeController()
@Controller('/ens/v1')
export class EnsReverseResolutionController {
  constructor(private readonly ensReverseResolver: EnsReverseResolver) {}

  @Post('/reverse/bulk')
  public async bulkReverseResolve(@Body() request: BulkReverseResolveRequest) {
    return this.ensReverseResolver.resolve(request);
  }

  @Post('/reverse/single/:address')
  public async reverseResolve(@Param('address') address: Address) {
    if (!isEthereumAddress(address)) {
      throw new BadRequestException('Invalid address');
    }
    return this.ensReverseResolver.resolve({ addresses: [address] });
  }

  @Delete('/reverse/cache')
  public deleteReverseResolveCache(@Body() request: DeleteReverseCacheRequest) {
    this.ensReverseResolver.clearCache(request.addresses);
  }
}
