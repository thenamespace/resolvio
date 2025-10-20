import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  IsArray,
  IsNumber,
  IsEthereumAddress,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'viem';

export class EnsNameRequest {
  @ApiProperty({
    description: 'ENS name to resolve',
    example: 'vitalik.eth',
    minLength: 6,
    maxLength: 256,
  })
  @IsString()
  // All ENS names are in lowercase
  // min characters are asd.eth -> three letters + dot + tld
  // max is capped at 256, which is enough
  @Length(6, 256, {
    message:
      'ENS name must be between 6 and 256 characters (e.g. "example.eth").',
  })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  name: string;
}

export class NoCache {
  @ApiProperty({
    description: 'Skip cache and fetch fresh data',
    required: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value && (value === 'true' || value === true);
  })
  noCache?: boolean;
}

export class EnsAddressesRequest extends NoCache {
  @ApiProperty({
    description:
      'Array of coin types to retrieve (e.g., [60, 0] for ETH and BTC)',
    required: false,
    type: [Number],
    example: [60, 0],
  })
  @IsOptional()
  @Type(() => Number) // <-- convert each element to number
  @IsNumber({}, { each: true }) // <-- validate each element
  coins?: number[];
}

export class EnsTextsRequest extends NoCache {
  @ApiProperty({
    description:
      'Array of text record keys to retrieve (e.g., ["avatar", "description"])',
    required: false,
    type: [String],
    example: ['avatar', 'description', 'keywords'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keys?: string[];
}

export class BulkReverseResolveRequest {
  @IsArray()
  @IsEthereumAddress({ each: true })
  address: Address[];
  @IsOptional()
  @IsNumber()
  chain_id?: number;
}

export class ReverseResolveResult {
  name?: string;
  hasReverseRecord: boolean;
  address: Address;
}

export class BulkReverseResolveResult {
  result: ReverseResolveResult[];
}
