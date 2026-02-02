import { Module } from "@nestjs/common";
import { ENSModule } from "src/ens/ens.module";
import { ResolverService } from "./resolver.service";

@Module({
    imports: [ENSModule],
    controllers: [],
    providers: [ResolverService]
})
export class ResolverModule {}