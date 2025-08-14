import { AddressRecord, EnsNamePlatform, EnsNameType, TextRecord } from "./ens-utils.dto"

export class ResolvedENS {
    name: string
    namehash: string
    labelhash: string
    texts?: TextRecord[]
    addresses?: AddressRecord[]
    contenthash?: string 
    metadata?: EnsMetadata
    expiry?: ENSExpiry
}

export class ENSExpiry {
    unix: number
    date: string
}

export class EnsMetadata {
    owner: string
    platform?: EnsNamePlatform
    nameType?: EnsNameType
}
