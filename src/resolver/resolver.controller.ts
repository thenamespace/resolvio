import { Controller, Get } from "@nestjs/common";
import { ResolverService } from "./resolver.service";

@Controller("/api/v1/resolver")
export class ResolverController {

    constructor(private readonly resolverService: ResolverService) {}

    @Get("/name/:name")
    public async resolve() {}

    @Get("/name/:name/addresses")
    public async resolveAddresses() {

    }

    @Get("/name/:name/texts")
    public async resolveTexts() {

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