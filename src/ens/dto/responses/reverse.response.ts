import type { Address } from 'viem';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponse } from './forward.response';

export class ReverseResolveResult {
  @ApiProperty({
    description: 'Primary ENS name for this address (if reverse record is set)',
    example: 'artii.eth',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Whether a reverse record exists for this address',
    example: true,
  })
  hasReverseRecord: boolean;

  @ApiProperty({
    description: 'Ethereum address',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  address: Address;
}

export class BulkReverseResolveResult {
  @ApiProperty({
    description: 'Array of reverse resolution results',
    type: [ReverseResolveResult],
  })
  result: ReverseResolveResult[];
}

export class ReverseProfileResponse {
  @ApiProperty({
    description: 'Requested Ethereum address',
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  address: Address;

  @ApiProperty({
    description: 'Whether a verified reverse record exists for this address',
    example: true,
  })
  hasReverseRecord: boolean;

  @ApiProperty({
    description:
      'Primary ENS name from the verified reverse record (null when none exists)',
    type: String,
    example: 'artii.eth',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description:
      'Value of the avatar text record, if present in the resolved profile',
    type: String,
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description:
      'Value of the name text record, if present in the resolved profile',
    type: String,
    example: 'Arti',
    nullable: true,
  })
  displayName: string | null;

  @ApiProperty({
    description:
      'Value of the description text record, if present in the resolved profile',
    type: String,
    example: 'ENS enjoyer',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description:
      'Full ENS profile (texts, addresses, contenthash, optional resolver). Null when there is no verified reverse record.',
    type: ProfileResponse,
    nullable: true,
  })
  profile: ProfileResponse | null;
}
