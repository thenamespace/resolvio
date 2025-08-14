import { Module } from "@nestjs/common";
import { ENSService } from "./ens.resolver";

@Module({
    exports: [ENSService],
    providers: [ENSService]
})
export class ENSModule {}