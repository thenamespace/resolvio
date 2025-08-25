import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResolverService } from "./resolver.service";
import { ResolveNameRequest } from "./types/resolve-name";

@Controller("/api/v1/resolve")
export class ResolverController {

    constructor(private readonly resolverService: ResolverService) {}

    @Get("/name/:name")
    public async resolve(@Param("name") name: string, @Query() request: ResolveNameRequest) {
        return this.resolverService.resolve(name, request)
    }
}