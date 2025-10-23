import { Module } from "@nestjs/common";
import { EnsResolver } from "./ens.resolver";
import { InMemoryEnsCache } from "./in-memory-ens.cache";
import { EnsResolveController } from "./ens.controller";
import { Web3Module } from "src/web3/web3.module";
import { EnsResolveSimplifiedController } from "./ens.controller.v2";

@Module({
    exports: [EnsResolver],
    providers: [EnsResolver, InMemoryEnsCache],
    controllers: [EnsResolveController, EnsResolveSimplifiedController],
    imports: [Web3Module]
})
export class ENSModule {}