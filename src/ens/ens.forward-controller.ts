import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnsForwardResolver } from './ens.forward-resolver';
import {
  ClearForwardCacheRequest,
  EnsAddressesRequest,
  EnsNameRequest,
  EnsTextsRequest,
  NoCache,
  ProfileRequest,
} from './dto';
import {
  ForwardAddressesResponse,
  ForwardTextsResponse,
  ProfileResponse,
} from './dto/responses/forward.response';
import { SUPPORTED_CHAINS } from './supported-chains';

@ApiTags('Forward Resolution')
@Controller('/ens/v2')
export class EnsForwardController {
  constructor(private readonly resolver: EnsForwardResolver) {}

  @Get('/chains')
  @ApiOperation({ summary: 'List supported chains' })
  @ApiResponse({ status: 200, description: 'Array of supported chain descriptors' })
  public getSupportedChains() {
    return SUPPORTED_CHAINS;
  }

  @Get('/texts/:name')
  @ApiOperation({ summary: 'Resolve text records for an ENS name' })
  @ApiParam({ name: 'name', example: 'artii.eth' })
  @ApiQuery({ name: 'keys', required: false, description: 'Comma-separated text record keys', example: 'avatar,com.twitter' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: ForwardTextsResponse })
  @ApiResponse({ status: 400, description: 'Invalid ENS name' })
  public getTexts(
    @Param() nameReq: EnsNameRequest,
    @Query() query: EnsTextsRequest,
  ) {
    return this.resolver.resolveTexts(nameReq.name, query);
  }

  @Get('/addresses/:name')
  @ApiOperation({ summary: 'Resolve cryptocurrency addresses for an ENS name' })
  @ApiParam({ name: 'name', example: 'artii.eth' })
  @ApiQuery({ name: 'chains', required: false, description: 'Comma-separated chain names', example: 'eth,btc,base' })
  @ApiQuery({ name: 'coins', required: false, description: 'Comma-separated coin type numbers', example: '60,0' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: ForwardAddressesResponse })
  @ApiResponse({ status: 400, description: 'Invalid ENS name or unsupported chain' })
  public getAddresses(
    @Param() nameReq: EnsNameRequest,
    @Query() query: EnsAddressesRequest,
  ) {
    return this.resolver.resolveAddresses(nameReq.name, query);
  }

  @Get('/contenthash/:name')
  @ApiOperation({ summary: 'Resolve the content hash for an ENS name' })
  @ApiParam({ name: 'name', example: 'artii.eth' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: 'ipfs://bafybeid...' },
        exists: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid ENS name' })
  public getContenthash(
    @Param() nameReq: EnsNameRequest,
    @Query() query: NoCache,
  ) {
    return this.resolver.resolveContenthash(nameReq.name, query.noCache);
  }

  @Get('/profile/:name')
  @ApiOperation({
    summary: 'Resolve a full ENS profile in a single RPC call',
    description:
      'Returns texts, addresses, and contenthash. When no query params are provided, uses the default profile (12 text keys, 8 chains). Set contenthash=true to include content hash.',
  })
  @ApiParam({ name: 'name', example: 'artii.eth' })
  @ApiQuery({ name: 'texts', required: false, description: 'Comma-separated text keys', example: 'avatar,com.twitter' })
  @ApiQuery({ name: 'addresses', required: false, description: 'Comma-separated chain names', example: 'eth,base,btc' })
  @ApiQuery({ name: 'contenthash', required: false, type: Boolean, description: 'Include content hash (default: false)' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: ProfileResponse })
  @ApiResponse({ status: 400, description: 'Invalid ENS name or unsupported chain' })
  public getProfile(
    @Param() nameReq: EnsNameRequest,
    @Query() query: ProfileRequest,
  ) {
    return this.resolver.resolveProfile(nameReq.name, query);
  }

  @Delete('/cache/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear cached records for an ENS name' })
  @ApiParam({ name: 'name', example: 'artii.eth' })
  @ApiQuery({ name: 'type', required: false, description: 'Cache type to clear (texts | addresses | contenthash | all)', example: 'all' })
  @ApiResponse({ status: 204, description: 'Cache cleared' })
  public clearCache(
    @Param() nameReq: EnsNameRequest,
    @Query() query: ClearForwardCacheRequest,
  ) {
    return this.resolver.clearCache(nameReq.name, query.type);
  }
}
