import { EnsAddressRecord, EnsTextRecord } from "../ens.types"

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