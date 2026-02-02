import { Injectable, NotImplementedException } from '@nestjs/common';
import { ResolveNameRequest, ResolveNameResponse } from './types/resolve-name';
import { EnsResolver } from 'src/ens/ens.resolver';
import { NameProtocol } from './types/protocol';

export interface IResolverService {
  resolve(name: string, resolveRequest: ResolveNameRequest);
}

@Injectable()
export class ResolverService implements IResolverService {
  constructor(private readonly ensResolver: EnsResolver) {}

  public async resolve(
    name: string,
    resolveRequest: ResolveNameRequest,
  ): Promise<ResolveNameResponse> {
    const nameProtocol = resolveRequest.protocol || NameProtocol.ENS;

    // currently we support only ENS
    // but we will support other protocols in the future
    // [.sol, .sui, etc ]
    if (nameProtocol === NameProtocol.ENS) {
      return this.resolveENS(name, resolveRequest);
    } else {
      throw new NotImplementedException(
        `Protocol ${nameProtocol as string} is not supported.`,
      );
    }
  }

  private async resolveENS(
    name: string,
    resolveRequest: ResolveNameRequest,
  ): Promise<ResolveNameResponse> {
    return this.ensResolver.resolve(name, resolveRequest);
  }
}
