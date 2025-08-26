import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResolverService } from "./resolver.service";
import { ResolveNameRequest } from "./types/resolve-name";
import { ApiTags } from "@nestjs/swagger";
import { EnsNameRequest } from "src/ens/dto/requests.dto";

@ApiTags("Resolution")
@Controller("/api/v1/resolve")
export class ResolverController {

    constructor(private readonly resolverService: ResolverService) {}

    @Get("/name/:name")
    public async resolve(@Param() name: EnsNameRequest, @Query() request: ResolveNameRequest) {
        return this.resolverService.resolve(name.name, request)
    }
}