export class ResolveNameRequest {
    name: string
    metadata?: boolean
    addresses?: boolean
    addressKeys?: string[]
    texts?: boolean
    textKeys?: string
    contenthash?: boolean
}