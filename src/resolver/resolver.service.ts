import { Injectable } from "@nestjs/common";
import { ResolveNameRequest } from "./types/resolve-name.request";
import { ResolveAddressRequest } from "./types/resolve-address.request";

export interface IResolverService {
    resolve(name: string, resolveRequest: ResolveNameRequest) 
    resolveAddress(name: string, resolveRequest: ResolveAddressRequest)
}

@Injectable()
export class ResolverService implements IResolverService {
    
    public async resolveAddress(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }
    public async resolveAddresses(name: string, resolveRequest: ResolveAddressRequest) {
        throw new Error("Method not implemented.");
    }

    public async resolve(name: string, resolveRequest: ResolveNameRequest) {
        
    }
}