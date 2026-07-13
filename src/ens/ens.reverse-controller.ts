import {
  BadRequestException,
  Controller,
  Get,
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
import { isEthereumAddress } from 'class-validator';
import type { Address } from 'viem';
import { EnsForwardResolver } from './ens.forward-resolver';
import { EnsReverseResolverV2 } from './ens.reverse-resolver';
import { NoCache, ProfileRequest, ReverseBulkRequest } from './dto';
import {
  BulkReverseResolveResult,
  ReverseProfileResponse,
  ReverseResolveResult,
} from './dto/responses/reverse.response';

@ApiTags('Reverse Resolution')
@Controller('/ens/v2/reverse')
export class EnsReverseController {
  constructor(
    private readonly resolver: EnsReverseResolverV2,
    private readonly forwardResolver: EnsForwardResolver,
  ) {}

  @Get('/bulk')
  @ApiOperation({
    summary: 'Bulk reverse resolve addresses to ENS names',
    description:
      'Resolves up to MAX_BULK_REVERSE_REQUEST addresses in a single batched RPC call.',
  })
  @ApiQuery({
    name: 'addresses',
    required: true,
    description: 'Comma-separated Ethereum addresses',
    example:
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5',
  })
  @ApiQuery({ name: 'noCache', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: BulkReverseResolveResult })
  @ApiResponse({
    status: 400,
    description: 'Invalid address or too many addresses',
  })
  public async resolveBulk(@Query() query: ReverseBulkRequest) {
    const addresses = await this.resolver.resolveBulk(
      query.addresses,
      query.noCache,
    );
    return { addresses };
  }

  @Get('/:address/profile')
  @ApiOperation({
    summary: 'Reverse-resolve an address to its verified ENS profile',
    description:
      'Validates the address, performs reverse resolution with forward verification, then returns the full ENS profile plus convenience fields (avatar, displayName, description). Returns 200 with null profile fields when no verified reverse record exists. Upstream RPC/resolver errors are propagated unchanged.',
  })
  @ApiParam({
    name: 'address',
    description: 'Ethereum address',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  @ApiQuery({
    name: 'texts',
    required: false,
    description:
      'Comma-separated profile text keys; defaults to the standard profile set',
    example: 'avatar,com.twitter',
  })
  @ApiQuery({
    name: 'addresses',
    required: false,
    description:
      'Comma-separated chain names or coin type numbers; defaults to the standard profile set',
    example: 'eth,base,btc',
  })
  @ApiQuery({
    name: 'contenthash',
    required: false,
    type: Boolean,
    description: 'Include contenthash in the profile (default: true)',
  })
  @ApiQuery({
    name: 'noCache',
    required: false,
    type: Boolean,
    description: 'Skip cache for both reverse and forward lookups',
  })
  @ApiResponse({ status: 200, type: ReverseProfileResponse })
  @ApiResponse({ status: 400, description: 'Invalid Ethereum address' })
  public async getReverseProfile(
    @Param('address') address: Address,
    @Query() query: ProfileRequest,
  ): Promise<ReverseProfileResponse> {
    if (!isEthereumAddress(address)) {
      throw new BadRequestException('Invalid Ethereum address');
    }

    const reverse = await this.resolver.resolveOne(
      address,
      query.noCache ?? false,
    );
    if (!reverse.hasReverseRecord || !reverse.name) {
      return {
        address,
        hasReverseRecord: false,
        name: null,
        avatar: null,
        displayName: null,
        description: null,
        profile: null,
      };
    }

    const profile = await this.forwardResolver.resolveProfile(reverse.name, {
      ...query,
      noCache: query.noCache ?? false,
    });

    return {
      address,
      hasReverseRecord: true,
      name: reverse.name,
      avatar: this.extractText(profile.texts, 'avatar'),
      displayName: this.extractText(profile.texts, 'name'),
      description: this.extractText(profile.texts, 'description'),
      profile,
    };
  }

  @Get('/:address')
  @ApiOperation({
    summary: 'Reverse resolve a single Ethereum address to its ENS name',
  })
  @ApiParam({
    name: 'address',
    description: 'Ethereum address',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
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

  private extractText(
    texts: { key: string; value?: string; exists: boolean }[],
    key: string,
  ): string | null {
    const record = texts.find((text) => text.key === key && text.exists);
    return record?.value ?? null;
  }
}
