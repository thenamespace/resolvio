import { arbitrum, base, optimism } from 'viem/chains';
import { OffchainLookupParams } from './ens.types';

export const convertEVMChainIdToCoinType = (chainId: number) => {
  return (0x80000000 | chainId) >>> 0;
};

export const convertCoinTypeToEVMChainId = (coinType: number) => {
  return coinType & 0x7fffffff;
};

export const BTC_COIN = 0;
export const ETH_COIN = 60;
export const BASE_COIN = convertEVMChainIdToCoinType(base.id);
export const OP_COIN = convertEVMChainIdToCoinType(optimism.id);
export const ARBITRUM_COIN = convertEVMChainIdToCoinType(arbitrum.id);
export const SOL_COIN = 501;

export const AVATAR_TEXT = 'avatar';
export const NAME_TEXT = 'name';
export const HEADER_TEXT = 'header';
export const DESCRIPTION_TEXT = 'description';
export const EMAIL_TEXT = 'mail';
export const URL_TEXT = 'url';
export const TWITTER_TEXT = 'com.twitter';
export const DISCORD_TEXT = 'com.discord';
export const TELEGRAM_TEXT = 'org.telegram';
export const GITHUB_TEXT = 'com.github';

const OFFCHAIN_LOOKUP = 'OffchainLookup';

export function isOffchainLookupErr(err: any): boolean {
  if (!err || !err.cause || !err.cause.data) {
    return false;
  }
  const { errorName } = err.cause.data;
  return errorName === OFFCHAIN_LOOKUP;
}

export function extractOffchainLookupData(err: any): OffchainLookupParams {
  const { args } = err.cause.data;
  const [sender, urls, calldata, callbackSignature, extraData] = args;

  return {
    sender,
    urls,
    calldata,
    callbackSignature,
    extraData,
  };
}