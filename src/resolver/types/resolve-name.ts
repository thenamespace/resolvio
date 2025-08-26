import { ApiProperty } from "@nestjs/swagger"
import { NameProtocol } from "./protocol"
import { IsEnum, IsInt, IsNumber, IsOptional } from "class-validator"
import { Type } from "class-transformer"

export class ResolveNameRequest {
    @ApiProperty({
        description: 'Optional naming protocol: [ "ens", "suins", "sol" ]. If not provided, defaults to "ens"',
        required: false,
        type: String,
        example: "ens"
    })
    @IsOptional()
    @IsEnum(NameProtocol)
    protocol?: NameProtocol
    @ApiProperty({
        description: 'Optional chain_id, some protocols like "ENS" support resolving multiple chains',
        required: false,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    chain_id?: number
}

export class ResolveNameResponse {
    value: string
    protocol?: NameProtocol
    chain_id?: number
}