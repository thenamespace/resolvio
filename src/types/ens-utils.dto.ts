export class TextRecord {
    key: string
    value: string
}

export class AddressRecord {
    coin: number
    address: string
}

export enum EnsNameType {
    Classic = "classic",
    CCIP = "ccip",
    NAMESPACE_CCIP_BASE = "namespace-base",
    NAMESPACE_CCIP_OP = "namespace-op",
    NAMESPACE_OFFCHAIN = "namespace-offchain"
}

export enum EnsNamePlatform {
    ENS = "ens",
    Namespace = "namespace",
    Base = "basenames",
    Linea = "lineanames",
    Unknown = "unknown"
}