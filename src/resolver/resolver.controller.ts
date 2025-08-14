import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResolverService } from "./resolver.service";
import { ResolveNameRequest } from "./types/resolve-name.request";
import { ResolveAddressRequest } from "./types/resolve-address.request";

@Controller("/api/v1/resolve")
export class ResolverController {

    constructor(private readonly resolverService: ResolverService) {}

    @Get("/name/:name")
    public async resolve(@Param("name") name: string, @Query() request: ResolveNameRequest) {
        return this.resolverService.resolve(name, request)
    }

    @Get("/name/:name/addresses")
    public async resolveAddresses(@Param("name") name: string, @Query() request: ResolveAddressRequest) {
        return this.resolverService.resolveAddress(name, request);
    }

    @Get("/name/:name/texts")
    public async resolveTexts(@Query("name") name: string, @Query() request: any) {
        return this.resolverService.resolveAddresses(name, request)
    }

    @Get("/name/:name/texts/:textKey")
    public async resolveText() {

    }

    @Get("/name/:name/addresses/:chainNameOrId")
    public async resolveAddress() {

    }

    @Get("/name/:name/contenthash")
    public async resolveContenthash() {

    }

    @Get("/name/:name/expiry")
    public async getNameExpiry() {

    }

    @Get("/name/:name/metadata")
    public async getMetadata() {

    }
}