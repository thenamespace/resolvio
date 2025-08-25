import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { EnsResolver } from "./ens.resolver";
import { EnsAddressesRequest, EnsNameRequest, EnsTextsRequest, NoCache } from "./dto/requests.dto";
import { CacheType } from "./interface/ens.cache";

@Controller("/api/v1/resolve/ens")
export class EnsResolveController {

    constructor(private readonly ensResolver: EnsResolver) {}

    @Get("/name/:name/profile")
    public async getEnsProfile(@Param() name: EnsNameRequest, @Query() cache: NoCache) {
        return this.ensResolver.resolveProfile(name.name, cache.noCache);
    }

    @Get("/name/:name/addresses")
    public getEnsAddresses(@Param() name: EnsNameRequest, @Query() addressRequest: EnsAddressesRequest) {
        return this.ensResolver.resolveAddresses(name.name, addressRequest.coins, addressRequest.noCache);
    }

    @Get("/name/:name/texts")
    public getEnsTexts(@Param() name: EnsNameRequest, @Query() textsRequest: EnsTextsRequest) {
        return this.ensResolver.resolveTexts(name.name, textsRequest.keys, textsRequest.noCache);
    }

    @Get("/name/:name/contenthash")
    public async getEnsContenthash(@Param() name: EnsNameRequest) {
        return this.ensResolver.resolveContenthash(name.name);
    }

    @Delete("/name/:name/cache")
    public async clearCache(@Param() name: EnsNameRequest) {
        return this.ensResolver.clearCache(name.name, CacheType.ALL);
    }
}