import { Injectable, NotImplementedException } from "@nestjs/common";
import { ResolveNameRequest, ResolveNameResponse } from "./types/resolve-name";
import { ResolveAddressRequest } from "./types/resolve-address.request";
import { EnsResolver } from "src/ens/ens.resolver";
import { NameProtocol } from "./types/protocol";
import { ETH_COIN } from "src/ens/ens.utils";

export interface IResolverService {
    resolve(name: string, resolveRequest: ResolveNameRequest)
}

@Injectable()
export class ResolverService implements IResolverService {

    constructor(private readonly ensResolver: EnsResolver) {}

    public async resolve(name: string, resolveRequest: ResolveNameRequest): Promise<ResolveNameResponse> {

        const nameProtocol = resolveRequest.protocol || NameProtocol.ENS;

        if (nameProtocol === NameProtocol.ENS) {
            return this.resolveENS(name, resolveRequest);
        } else {
            throw new NotImplementedException(`Protocol ${nameProtocol} is not supported.`);
        }
    }

    private async resolveENS(name: string, resolveRequest: ResolveNameRequest): Promise<ResolveNameResponse> {

        let promises: Promise<string>[] = []

        const coinType = resolveRequest.chainId || ETH_COIN
        const addressPromise = this.ensResolver.resolveAddress(name, coinType);

        promises.push(addressPromise);

        if (resolveRequest.avatar) {
            const avatarPromise = this.ensResolver.resolveText(name, "avatar");
            promises.push(avatarPromise);
        }

        const [address, avatar] = await Promise.all(promises);

        return {
            avatar: avatar,
            value: address,
            chainId: coinType || undefined
        }

    }

    public async resolveAddresses(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }
}