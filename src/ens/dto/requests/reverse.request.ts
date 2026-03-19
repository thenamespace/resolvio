import {
  IsArray,
  IsEthereumAddress,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'viem';
import { NoCache } from './no-cache.request';

export class BulkReverseResolveRequest extends NoCache {
  @ApiProperty({
    description: 'Array of Ethereum addresses to reverse resolve',
    type: [String],
    example: [
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      '0x225f137127d9067788314bc7fcc1f36746a3c3B5',
    ],
  })
  @IsArray()
  @IsEthereumAddress({ each: true })
  addresses: Address[];

  @IsOptional()
  @IsNumber()
  chain_id?: number;
}

export class DeleteReverseCacheRequest {
  @IsArray()
  @IsEthereumAddress({ each: true })
  addresses: Address[];
}
