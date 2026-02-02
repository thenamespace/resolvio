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
import { EnsResolver } from './ens.resolver';
import {
  BulkReverseResolveRequest,
  DeleteReverseCacheRequest,
  EnsAddressesRequest,
  EnsNameRequest,
  EnsTextsRequest,
  NoCache,
} from './dto/requests.dto';
import { CacheType } from './interface/ens.cache';
import { ENS_ENDPOINTS } from '../docs/ens.endpoints';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { type Address } from 'viem';
import { isEthereumAddress } from 'class-validator';
import { EnsReverseResolver } from './ens-resverse.resolver';

@ApiTags('Forward Resolution')
@Controller('/ens/v1')
export class EnsForwardResolutionController {
  constructor(private readonly ensResolver: EnsResolver) {}

  @Get('/profile/:name')
  @ENS_ENDPOINTS.getEnsProfile.operation
  @ENS_ENDPOINTS.getEnsProfile.param
  @ENS_ENDPOINTS.getEnsProfile.query
  @ENS_ENDPOINTS.getEnsProfile.response
  @ENS_ENDPOINTS.getEnsProfile.response400
  @ENS_ENDPOINTS.getEnsProfile.response404
  public async getEnsProfile(
    @Param() name: EnsNameRequest,
    @Query() cache: NoCache,
  ) {
    return this.ensResolver.resolveProfile(name.name, cache.noCache || false);
  }

  @Get('/addresses/:name')
  @ENS_ENDPOINTS.getEnsAddresses.operation
  @ENS_ENDPOINTS.getEnsAddresses.param
  @ENS_ENDPOINTS.getEnsAddresses.query
  @ENS_ENDPOINTS.getEnsAddresses.queryNoCache
  @ENS_ENDPOINTS.getEnsAddresses.response
  @ENS_ENDPOINTS.getEnsAddresses.response400
  @ENS_ENDPOINTS.getEnsAddresses.response404
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
  @ENS_ENDPOINTS.getEnsTexts.operation
  @ENS_ENDPOINTS.getEnsTexts.param
  @ENS_ENDPOINTS.getEnsTexts.query
  @ENS_ENDPOINTS.getEnsTexts.queryNoCache
  @ENS_ENDPOINTS.getEnsTexts.response
  @ENS_ENDPOINTS.getEnsTexts.response400
  @ENS_ENDPOINTS.getEnsTexts.response404
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
  @ENS_ENDPOINTS.getEnsContenthash.operation
  @ENS_ENDPOINTS.getEnsContenthash.param
  @ENS_ENDPOINTS.getEnsContenthash.response
  @ENS_ENDPOINTS.getEnsContenthash.response400
  @ENS_ENDPOINTS.getEnsContenthash.response404
  public async getEnsContenthash(@Param() name: EnsNameRequest) {
    return this.ensResolver.resolveContenthash(name.name);
  }

  @Delete('/cache/:name')
  @ApiExcludeEndpoint()
  public clearCache(@Param() name: EnsNameRequest) {
    return this.ensResolver.clearCache(name.name, CacheType.ALL);
  }
}

@ApiTags('Reverse Resolution')
@Controller('/ens/v1')
export class EnsReverseResolutionController {
  constructor(private readonly ensReverseResolver: EnsReverseResolver) {}

  @Post('/reverse/bulk')
  @ENS_ENDPOINTS.bulkReverseResolve.operation
  @ENS_ENDPOINTS.bulkReverseResolve.body
  @ENS_ENDPOINTS.bulkReverseResolve.response
  @ENS_ENDPOINTS.bulkReverseResolve.response400
  public async bulkReverseResolve(@Body() request: BulkReverseResolveRequest) {
    return this.ensReverseResolver.resolve(request);
  }

  @Post('/reverse/single/:address')
  @ENS_ENDPOINTS.reverseResolve.operation
  @ENS_ENDPOINTS.reverseResolve.param
  @ENS_ENDPOINTS.reverseResolve.response
  @ENS_ENDPOINTS.reverseResolve.response400
  public async reverseResolve(@Param('address') address: Address) {
    if (!isEthereumAddress(address)) {
      throw new BadRequestException('Invalid address');
    }

    return this.ensReverseResolver.resolve({
      addresses: [address],
    });
  }

  @Delete('/reverse/cache')
  @ApiExcludeEndpoint()
  public deleteReverseResolveCache(@Body() request: DeleteReverseCacheRequest) {
    this.ensReverseResolver.clearCache(request.addresses);
  }
}
