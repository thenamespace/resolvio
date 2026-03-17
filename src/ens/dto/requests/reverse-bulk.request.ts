import { Transform } from 'class-transformer';
import { IsArray, IsEthereumAddress } from 'class-validator';
import { NoCache } from './no-cache.request';
import type { Address } from 'viem';

function splitAddresses(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : [String(value)];
  return arr
    .flatMap((v: string) => String(v).split(','))
    .map((s: string) => s.trim())
    .filter(Boolean);
}

export class ReverseBulkRequest extends NoCache {
  @Transform(({ value }) => splitAddresses(value))
  @IsArray()
  @IsEthereumAddress({ each: true })
  addresses: Address[];
}
