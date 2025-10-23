import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { EnsResolver } from "./ens.resolver";
import { BulkReverseResolveRequest, EnsAddressesRequest, EnsNameRequest, EnsTextsRequest, NoCache } from "./dto/requests.dto";
import { CacheType } from "./interface/ens.cache";
import { EnsMetadata } from "./ens.types";
import { ENS_ENDPOINTS } from "../docs/ens.endpoints";
import { type Address } from "viem";
import { isEthereumAddress } from "class-validator";

@Controller("/api/v1/resolve/ens")
export class EnsResolveController {

    constructor(private readonly ensResolver: EnsResolver) {}

    @Get("/name/:name/profile")
    @ENS_ENDPOINTS.getEnsProfile.operation
    @ENS_ENDPOINTS.getEnsProfile.tags
    @ENS_ENDPOINTS.getEnsProfile.param
    @ENS_ENDPOINTS.getEnsProfile.query
    @ENS_ENDPOINTS.getEnsProfile.response
    @ENS_ENDPOINTS.getEnsProfile.response400
    @ENS_ENDPOINTS.getEnsProfile.response404
    public async getEnsProfile(@Param() name: EnsNameRequest, @Query() cache: NoCache) {
        return this.ensResolver.resolveProfile(name.name, cache.noCache || false);
    }

    @Get("/name/:name/addresses")
    @ENS_ENDPOINTS.getEnsAddresses.operation
    @ENS_ENDPOINTS.getEnsAddresses.tags
    @ENS_ENDPOINTS.getEnsAddresses.param
    @ENS_ENDPOINTS.getEnsAddresses.query
    @ENS_ENDPOINTS.getEnsAddresses.queryNoCache
    @ENS_ENDPOINTS.getEnsAddresses.response
    @ENS_ENDPOINTS.getEnsAddresses.response400
    @ENS_ENDPOINTS.getEnsAddresses.response404
    public getEnsAddresses(@Param() name: EnsNameRequest, @Query() addressRequest: EnsAddressesRequest) {
        return this.ensResolver.resolveAddresses(name.name, addressRequest.coins, addressRequest.noCache);
    }

    @Get("/name/:name/texts")
    @ENS_ENDPOINTS.getEnsTexts.operation
    @ENS_ENDPOINTS.getEnsTexts.tags
    @ENS_ENDPOINTS.getEnsTexts.param
    @ENS_ENDPOINTS.getEnsTexts.query
    @ENS_ENDPOINTS.getEnsTexts.queryNoCache
    @ENS_ENDPOINTS.getEnsTexts.response
    @ENS_ENDPOINTS.getEnsTexts.response400
    @ENS_ENDPOINTS.getEnsTexts.response404
    public getEnsTexts(@Param() name: EnsNameRequest, @Query() textsRequest: EnsTextsRequest) {
        return this.ensResolver.resolveTexts(name.name, textsRequest.keys, textsRequest.noCache);
    }

    @Get("/name/:name/metadata")
    @ENS_ENDPOINTS.getEnsMetadata.operation
    @ENS_ENDPOINTS.getEnsMetadata.tags
    @ENS_ENDPOINTS.getEnsMetadata.param
    @ENS_ENDPOINTS.getEnsMetadata.response
    @ENS_ENDPOINTS.getEnsMetadata.response400
    @ENS_ENDPOINTS.getEnsMetadata.response404
    public getEnsMetadata(@Param() name: EnsNameRequest, @Query() metadataRequest: EnsMetadata) {

        
    }

    @Get("/name/:name/contenthash")
    @ENS_ENDPOINTS.getEnsContenthash.operation
    @ENS_ENDPOINTS.getEnsContenthash.tags
    @ENS_ENDPOINTS.getEnsContenthash.param
    @ENS_ENDPOINTS.getEnsContenthash.response
    @ENS_ENDPOINTS.getEnsContenthash.response400
    @ENS_ENDPOINTS.getEnsContenthash.response404
    public async getEnsContenthash(@Param() name: EnsNameRequest) {
        return this.ensResolver.resolveContenthash(name.name);
    }

    @Delete("/name/:name/cache")
    @ENS_ENDPOINTS.clearCache.operation
    @ENS_ENDPOINTS.clearCache.tags
    @ENS_ENDPOINTS.clearCache.param
    @ENS_ENDPOINTS.clearCache.response
    @ENS_ENDPOINTS.clearCache.response400
    public async clearCache(@Param() name: EnsNameRequest) {
        return this.ensResolver.clearCache(name.name, CacheType.ALL);
    }


    @Post("/reverse/bulk")
    @ENS_ENDPOINTS.bulkReverseResolve.operation
    @ENS_ENDPOINTS.bulkReverseResolve.tags
    @ENS_ENDPOINTS.bulkReverseResolve.body
    @ENS_ENDPOINTS.bulkReverseResolve.response
    @ENS_ENDPOINTS.bulkReverseResolve.response400
    public async bulkReverseResolve(@Body() request: BulkReverseResolveRequest) {
        return this.ensResolver.bulkReverseResolve(request);
    }

    @Post("/reverse/single/:address")
    @ENS_ENDPOINTS.reverseResolve.operation
    @ENS_ENDPOINTS.reverseResolve.tags
    @ENS_ENDPOINTS.reverseResolve.param
    @ENS_ENDPOINTS.reverseResolve.response
    @ENS_ENDPOINTS.reverseResolve.response400
    public async reverseResolve(@Param("address") address: Address) {

        if (!isEthereumAddress(address)) {
            throw new BadRequestException("Invalid address")
        }

        return this.ensResolver.bulkReverseResolve({
            addresses: [address]
        })
    }
}