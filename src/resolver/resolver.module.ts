import { Module } from "@nestjs/common";
import { ENSModule } from "src/ens/ens.module";
import { ResolverService } from "./resolver.service";
import { ResolverController } from "./resolver.controller";

@Module({
    imports: [ENSModule],
    controllers: [ResolverController],
    providers: [ResolverService]
})
export class ResolverModule {}