import { Transform } from "class-transformer"
import { IsOptional, IsString, Length, IsArray, IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class EnsNameRequest {

    @ApiProperty({
        description: 'ENS name to resolve',
        example: 'vitalik.eth',
        minLength: 6,
        maxLength: 256
    })
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

export class NoCache {
    @ApiProperty({
        description: 'Skip cache and fetch fresh data',
        required: false,
        default: false
    })
    @IsOptional()
    @Transform(({ value }) => value && value === "true" )
    noCache?: boolean
}

export class EnsAddressesRequest extends NoCache {
    @ApiProperty({
        description: 'Array of coin types to retrieve (e.g., [60, 0] for ETH and BTC)',
        required: false,
        type: [Number],
        example: [60, 0]
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    coins?: number[]
}

export class EnsTextsRequest extends NoCache {
    @ApiProperty({
        description: 'Array of text record keys to retrieve (e.g., ["avatar", "description"])',
        required: false,
        type: [String],
        example: ['avatar', 'description', 'keywords']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keys?: string[]
}

export class EnsProfileRequest {
    @ApiProperty({
        description: 'Array of coin types for addresses to include',
        required: false,
        type: [Number],
        example: [60, 0]
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    addresses?: number[]

    @ApiProperty({
        description: 'Array of text record keys to include',
        required: false,
        type: [String],
        example: ['avatar', 'description']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    texts?: string[]

    @ApiProperty({
        description: 'Include content hash in profile',
        required: false,
        default: true
    })
    @IsOptional()
    contenthash?: boolean
}