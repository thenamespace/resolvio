import { EnsNameType } from 'src/types/ens-utils.dto';
import { EnsAddressRecord, EnsTextRecord } from '../../ens.types';

export class EnsAddressesResponse {
  name: string;
  resolver?: string;
  addresses: EnsAddressRecord[];
}

export class EnsTextsResponse {
  name: string;
  resolver?: string;
  texts: EnsTextRecord[];
}

export class EnsMetadataResponse {
  owner: string;
  source: EnsNameType;
  chainId: number;
}
