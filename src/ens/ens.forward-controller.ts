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
  EnsAddressesRequest,
  EnsNameRequest,
  EnsTextsRequest,
  NoCache,
} from './dto/requests.dto';

@Controller('/ens/v2')
export class EnsForwardController {
  constructor(private readonly resolver: EnsForwardResolver) {}

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

  @Delete('/cache/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  public clearCache(@Param() nameReq: EnsNameRequest) {
    return this.resolver.clearCache(nameReq.name);
  }
}
