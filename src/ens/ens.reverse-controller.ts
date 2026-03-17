import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { isEthereumAddress } from 'class-validator';
import type { Address } from 'viem';
import { EnsReverseResolverV2 } from './ens.reverse-resolver';
import { NoCache, ReverseBulkRequest } from './dto';

@Controller('/ens/v2/reverse')
export class EnsReverseController {
  constructor(private readonly resolver: EnsReverseResolverV2) {}

  @Get('/bulk')
  public async resolveBulk(@Query() query: ReverseBulkRequest) {
    const addresses = await this.resolver.resolveBulk(query.addresses, query.noCache);
    return { addresses };
  }

  @Get('/:address')
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
