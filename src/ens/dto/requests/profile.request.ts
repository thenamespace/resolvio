import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { NoCache } from './no-cache.request';

export const DEFAULT_PROFILE_TEXTS = [
  'avatar',
  'header',
  'name',
  'description',
  'url',
  'location',
  'email',
  'com.twitter',
  'com.discord',
  'com.github',
  'org.telegram',
  'com.youtube',
];

export const DEFAULT_PROFILE_CHAINS = [
  'eth',
  'base',
  'arb1',
  'op',
  'matic',
  'celo',
  'btc',
  'sol',
];

// Fallback when DEFAULT_PROFILE_CHAINS is empty
export const DEFAULT_PROFILE_ADDRESSES = ['eth'];
export const DEFAULT_PROFILE_CONTENTHASH = false;

function splitParam(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : [String(value)];
  return arr
    .flatMap((v: string) => String(v).split(','))
    .map((s: string) => s.trim())
    .filter(Boolean);
}

export class ProfileRequest extends NoCache {
  /**
   * Text record keys to fetch.
   * Accepts repeated params (?texts=avatar&texts=email) or comma-separated (?texts=avatar,email).
   * Defaults to a standard set when omitted.
   */
  @IsOptional()
  @Transform(({ value }) => splitParam(value))
  @IsArray()
  @IsString({ each: true })
  texts?: string[];

  /**
   * Addresses to fetch — chain names (eth, btc, op) or coin type numbers (60, 0).
   * Mixed values are allowed: ?addresses=eth,60,op.
   * Defaults to ['eth'] when omitted.
   */
  @IsOptional()
  @Transform(({ value }) => splitParam(value))
  @IsArray()
  @IsString({ each: true })
  addresses?: string[];

  /**
   * Whether to include the contenthash record. Defaults to true.
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  contenthash?: boolean;
}
