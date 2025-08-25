import { NameProtocol } from "./protocol"

export class ResolveNameRequest {
    avatar?: boolean
    protocol?: NameProtocol
    chainId?: number
}

export class ResolveNameResponse {
    value: string
    protocol?: NameProtocol
    avatar?: string
    chainId?: number
}