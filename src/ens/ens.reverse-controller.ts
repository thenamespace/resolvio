import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isEthereumAddress } from 'class-validator';
import type { Address } from 'viem';
import { EnsReverseResolverV2 } from './ens.reverse-resolver';
import { NoCache, ReverseBulkRequest } from './dto';
import { BulkReverseResolveResult, ReverseResolveResult } from './dto/responses/reverse.response';

@ApiTags('Reverse Resolution')
@Controller('/ens/v2/reverse')
export class EnsReverseController {
  constructor(private readonly resolver: EnsReverseResolverV2) {}

  @Get('/bulk')
  @ApiOperation({
    summary: 'Bulk reverse resolve addresses to ENS names',
    description: 'Resolves up to MAX_BULK_REVERSE_REQUEST addresses in a single batched RPC call.',
  })
  @ApiQuery({ name: 'addresses', required: true, description: 'Comma-separated Ethereum addresses', example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: BulkReverseResolveResult })
  @ApiResponse({ status: 400, description: 'Invalid address or too many addresses' })
  public async resolveBulk(@Query() query: ReverseBulkRequest) {
    const addresses = await this.resolver.resolveBulk(query.addresses, query.noCache);
    return { addresses };
  }

  @Get('/:address')
  @ApiOperation({ summary: 'Reverse resolve a single Ethereum address to its ENS name' })
  @ApiParam({ name: 'address', description: 'Ethereum address', example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: ReverseResolveResult })
  @ApiResponse({ status: 400, description: 'Invalid Ethereum address' })
  public resolveOne(
    @Param('address') address: Address,
    @Query() query: NoCache,
  ) {
    if (!isEthereumAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address');
    }
    return this.resolver.resolveOne(address, query.noCache);
  }
}
