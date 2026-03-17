import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { EnsForwardResolver } from './ens.forward-resolver';
import {
  ClearForwardCacheRequest,
  EnsAddressesRequest,
  EnsNameRequest,
  EnsTextsRequest,
  NoCache,
  ProfileRequest,
} from './dto';
import { SUPPORTED_CHAINS } from './supported-chains';

@Controller('/ens/v2')
export class EnsForwardController {
  constructor(private readonly resolver: EnsForwardResolver) {}

  @Get('/chains')
  public getSupportedChains() {
    return SUPPORTED_CHAINS;
  }

  @Get('/texts/:name')
  public getTexts(
    @Param() nameReq: EnsNameRequest,
    @Query() query: EnsTextsRequest,
  ) {
    return this.resolver.resolveTexts(nameReq.name, query);
  }

  @Get('/addresses/:name')
  public getAddresses(
    @Param() nameReq: EnsNameRequest,
    @Query() query: EnsAddressesRequest,
  ) {
    return this.resolver.resolveAddresses(nameReq.name, query);
  }

  @Get('/contenthash/:name')
  public getContenthash(
    @Param() nameReq: EnsNameRequest,
    @Query() query: NoCache,
  ) {
    return this.resolver.resolveContenthash(nameReq.name, query.noCache);
  }

  @Get('/profile/:name')
  public getProfile(
    @Param() nameReq: EnsNameRequest,
    @Query() query: ProfileRequest,
  ) {
    return this.resolver.resolveProfile(nameReq.name, query);
  }

  @Delete('/cache/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  public clearCache(
    @Param() nameReq: EnsNameRequest,
    @Query() query: ClearForwardCacheRequest,
  ) {
    return this.resolver.clearCache(nameReq.name, query.type);
  }
}
