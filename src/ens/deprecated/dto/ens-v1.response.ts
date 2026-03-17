import { EnsAddressRecord, EnsTextRecord } from '../../ens.types';

export enum EnsNameType {
  Classic = 'classic',
  CCIP = 'ccip',
  NAMESPACE_CCIP_BASE = 'namespace-base',
  NAMESPACE_CCIP_OP = 'namespace-op',
  NAMESPACE_OFFCHAIN = 'namespace-offchain',
}

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
