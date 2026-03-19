import { ApiProperty } from '@nestjs/swagger';
import type { Address } from 'viem';

export class TextResult {
  @ApiProperty({ example: 'avatar' })
  key: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  value?: string;

  @ApiProperty({ example: true })
  exists: boolean;
}

export class AddressResult {
  @ApiProperty({ example: 60, description: 'Coin type identifier' })
  coin: number;

  @ApiProperty({ example: 'eth', description: 'Chain name', required: false })
  chain?: string;

  @ApiProperty({ example: '0x179A862703a4adfb29896552DF9e307980D19285', required: false })
  value?: string;

  @ApiProperty({ example: true })
  exists: boolean;
}

export class ContenthashResult {
  @ApiProperty({ example: 'ipfs://bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m', required: false })
  value?: string;

  @ApiProperty({ example: true })
  exists: boolean;
}

export class ForwardTextsResponse {
  @ApiProperty({ example: 'artii.eth' })
  name: string;

  @ApiProperty({ type: [TextResult] })
  texts: TextResult[];
}

export class ForwardAddressesResponse {
  @ApiProperty({ example: 'artii.eth' })
  name: string;

  @ApiProperty({ type: [AddressResult] })
  addresses: AddressResult[];
}

export class ProfileResponse {
  @ApiProperty({ example: 'artii.eth' })
  name: string;

  @ApiProperty({ type: [TextResult] })
  texts: TextResult[];

  @ApiProperty({ type: [AddressResult] })
  addresses: AddressResult[];

  @ApiProperty({ type: ContenthashResult })
  contenthash: ContenthashResult;

  @ApiProperty({ example: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63', required: false })
  resolver?: Address;
}
