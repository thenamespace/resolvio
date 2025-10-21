import { EnsNameType } from "src/types/ens-utils.dto"
import { EnsAddressRecord, EnsTextRecord } from "../ens.types"
import type { Address } from "viem"
import { ApiProperty } from '@nestjs/swagger'

export class EnsAddressesResponse {
    name: string
    resolver?: string
    addresses: EnsAddressRecord[]
}

export class EnsTextsResponse {
    name: string
    resolver?: string
    texts: EnsTextRecord[]
}

export class EnsMetadataResponse {
    owner: string
    source: EnsNameType
    chainId: number
}

export class ReverseResolveResult {
  @ApiProperty({
    description: 'Primary ENS name for this address (if reverse record is set)',
    example: 'vitalik.eth',
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