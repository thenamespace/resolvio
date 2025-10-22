import { AddressRecord, TextRecord } from "src/types/ens-utils.dto";
import type { Address } from "viem";
import { ApiProperty } from "@nestjs/swagger";
import { Hash } from "crypto";

export class EnsProfile {
    @ApiProperty({
        description: 'ENS name that was resolved',
        example: 'vitalik.eth'
    })
    name: string

    @ApiProperty({
        description: 'Array of text records associated with the ENS name',
        type: [TextRecord],
        required: false
    })
    texts?: TextRecord[]

    @ApiProperty({
        description: 'Array of cryptocurrency addresses associated with the ENS name',
        type: [AddressRecord],
        required: false
    })
    addresses?: AddressRecord[]

    @ApiProperty({
        description: 'Content hash associated with the ENS name (IPFS, IPNS, etc.)',
        required: false,
        example: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
    })
    contenthash?: string

    @ApiProperty({
        description: 'Address of the ENS resolver contract',
        example: '0x4976fb03C32e5B8cfe2b6cA31A7e9D2b6c7c5c5c5c'
    })
    resolver: string
}

export class EnsTextRecord {
    @ApiProperty({
        description: 'Text record key',
        example: 'avatar'
    })
    key: string

    @ApiProperty({
        description: 'Text record value',
        example: 'https://example.com/avatar.jpg'
    })
    value: string
}

export class EnsAddressRecord {
    @ApiProperty({
        description: 'Coin type identifier (e.g., 60 for ETH, 0 for BTC)',
        example: 60
    })
    coin: number

    @ApiProperty({
        description: 'Human-readable coin name',
        example: 'eth'
    })
    name: string

    @ApiProperty({
        description: 'Cryptocurrency address',
        example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    })
    address: string
}

export class EnsMetadata {
    @ApiProperty({
        description: 'Type of ENS record',
        enum: ['ens', 'ccip', 'namespace-ccip'],
        example: 'ens'
    })
    type: "ens" | "ccip" | "namespace-ccip";

    @ApiProperty({
        description: 'Address of the ENS resolver contract',
        required: false,
        example: '0x4976fb03C32e5B8cfe2b6cA31A7e9D2b6c7c5c5c5c'
    })
    resolver?: string

    @ApiProperty({
        description: 'Address of the current owner of the ENS name',
        example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    })
    ownership: Address

    @ApiProperty({
        description: 'Blockchain network ID',
        example: 1
    })
    chainId: number

    @ApiProperty({
        description: 'Expiration timestamp of the ENS name registration',
        example: 1735689600
    })
    expiry: number
}

export interface OffchainLookupParams {
    sender: Address
    urls: string[]
    calldata: Hash
    extraData: Hash
    callbackSignature: Hash
}