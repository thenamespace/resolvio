import { Address } from 'viem';

export class TextResult {
  key: string;
  value?: string;
  exists: boolean;
}

export class AddressResult {
  coin: number;
  chain?: string;
  value?: string;
  exists: boolean;
}

export class ContenthashResult {
  value?: string;
  exists: boolean;
}

export class ForwardTextsResponse {
  name: string;
  texts: TextResult[];
}

export class ForwardAddressesResponse {
  name: string;
  addresses: AddressResult[];
}

export class ProfileResponse {
  name: string;
  texts: TextResult[];
  addresses: AddressResult[];
  contenthash: ContenthashResult;
  resolver?: Address;
}
