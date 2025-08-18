import { Module } from "@nestjs/common";
import { EnsResolver } from "./ens.resolver";
import { InMemoryEnsCache } from "./in-memory-ens.cache";
import { EnsResolveController } from "./ens.controller";

@Module({
    exports: [EnsResolver],
    providers: [EnsResolver, InMemoryEnsCache],
    controllers: [EnsResolveController]
})
export class ENSModule {}