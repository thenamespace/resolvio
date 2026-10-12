import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Defaults in seconds
const DEFAULT_FORWARD_CACHE_EXPIRY_S = 5 * 60; // 5 minutes
const DEFAULT_REVERSE_CACHE_EXPIRY_S = 30 * 60; // 30 minutes
const DEFAULT_MAX_BULK_REVERSE_REQUEST = 20;
const DEFAULT_MAX_BULK_PROFILE_REQUEST = 20;
const DEFAULT_MIN_CACHE_REFRESH_INTERVAL_S = 5;

const toMillis = (seconds: number) => seconds * 1000;

@Injectable()
export class AppProperties {
  readonly mainRpcUrl: string;
  readonly fallbackRpcUrls: string[];
  readonly isTestnet: boolean;
  readonly forwardResolveCacheExpiry: number;
  readonly reverseResolveCacheExpiry: number;
  readonly maxBulkReverseRequest: number;
  readonly maxBulkProfileRequest: number;
  // Minimum time between cache refreshes (noCache / cache clear) for the same entry
  readonly minCacheRefreshInterval: number;
  readonly enableDocs: boolean;

  constructor(config: ConfigService) {
    // RPC_URL is kept as a legacy alias for MAIN_RPC_URL
    this.mainRpcUrl =
      config.get<string>('MAIN_RPC_URL') || config.get<string>('RPC_URL') || '';
    this.fallbackRpcUrls = (config.get<string>('FALLBACK_RPC_URLS') ?? '')
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url !== '' && url !== this.mainRpcUrl);
    this.isTestnet = config.get<string>('IS_TESTNET') === 'true';

    const fwdRaw = config.get<string>('FORWARD_RESOLVE_CACHE_EXPIRY') ?? '';
    const fwdSeconds =
      fwdRaw === '' ? DEFAULT_FORWARD_CACHE_EXPIRY_S : parseInt(fwdRaw);
    this.forwardResolveCacheExpiry = toMillis(fwdSeconds);

    const revRaw = config.get<string>('REVERSE_RESOLVE_CACHE_EXPIRY') ?? '';
    const revSeconds =
      revRaw === '' ? DEFAULT_REVERSE_CACHE_EXPIRY_S : parseInt(revRaw);
    this.reverseResolveCacheExpiry = toMillis(revSeconds);

    const bulkRaw = config.get<string>('MAX_BULK_REVERSE_REQUEST') ?? '';
    this.maxBulkReverseRequest =
      bulkRaw === '' ? DEFAULT_MAX_BULK_REVERSE_REQUEST : parseInt(bulkRaw);

    const bulkProfileRaw = config.get<string>('MAX_BULK_PROFILE_REQUEST') ?? '';
    this.maxBulkProfileRequest =
      bulkProfileRaw === '' ? DEFAULT_MAX_BULK_PROFILE_REQUEST : parseInt(bulkProfileRaw);

    const refreshRaw = config.get<string>('MIN_CACHE_REFRESH_INTERVAL') ?? '';
    const refreshParsed = parseInt(refreshRaw);
    // 0 or negative disables throttling, invalid values fall back to default
    const refreshSeconds = isNaN(refreshParsed)
      ? DEFAULT_MIN_CACHE_REFRESH_INTERVAL_S
      : Math.max(0, refreshParsed);
    this.minCacheRefreshInterval = toMillis(refreshSeconds);

    this.enableDocs = config.get<string>('ENABLE_DOCS') === 'true';
  }
}
