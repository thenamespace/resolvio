import { Module } from "@nestjs/common";
import { EnsResolver } from "./ens.resolver";
import { InMemoryEnsCache } from "./in-memory-ens.cache";
import { Web3Module } from "src/web3/web3.module";
import { EnsResolveSimplifiedController } from "./ens.controller.v2";
import { EnsReverseResolver } from "./ens-resverse.resolver";

@Module({
    exports: [EnsResolver],
    providers: [EnsResolver, InMemoryEnsCache, EnsReverseResolver],
    controllers: [EnsResolveSimplifiedController],
    imports: [Web3Module]
})
export class ENSModule {}