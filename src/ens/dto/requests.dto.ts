import { Transform } from "class-transformer"
import { IsString, Length } from "class-validator"

export class EnsNameRequest {

    @IsString()
    // All ENS names are in lowercase
    // min characters are asd.eth -> three letters + dot + tld
    // max is capped at 256, which is enough
    @Length(6, 256, {
        message:
            'ENS name must be between 6 and 256 characters (e.g. "example.eth").',
    })
    @Transform(({ value }) => String(value).trim().toLowerCase())
    name: string
}

export class EnsAddressesRequest {
    coins?: number[]
    noCache?: boolean
}

export class EnsTextsRequest {
    keys?: string[]
    noCache?: boolean
}

export class EnsProfileRequest {
    addresses?: number[]
    texts?: string[]
    contenthash?: boolean
}