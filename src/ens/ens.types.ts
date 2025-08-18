import { AddressRecord, TextRecord } from "src/types/ens-utils.dto";
import { Address } from "viem";

export class EnsProfile {
    name: string
    texts?: TextRecord[]
    addresses?: AddressRecord[]
    contenthash?: string
    resolver: string
}

export class EnsTextRecord {
    key: string
    value: string
}

export class EnsAddressRecord {
    coin: number
    name: string
    address: string
}

export class EnsMetadata {
    type: "ens" | "ccip" | "namespace-ccip";
    resolver?: string;
    ownership: Address
    chainId: number
    expiry: number
}