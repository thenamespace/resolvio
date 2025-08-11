import { Module } from "@nestjs/common";
import { ENSService } from "./ens.service";

@Module({
    exports: [ENSService],
    providers: [ENSService]
})
export class ENSModule {}