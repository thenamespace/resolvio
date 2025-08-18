import { arbitrum, base, optimism, polygon } from "viem/chains";

export const convertEVMChainIdToCoinType = (chainId: number) => {
    return (0x80000000 | chainId) >>> 0;
};

export const convertCoinTypeToEVMChainId = (coinType: number) => {
  return coinType & 0x7fffffff;
};

export const BTC_COIN = 0
export const ETH_COIN = 60
export const BASE_COIN = convertEVMChainIdToCoinType(base.id)
export const OP_COIN = convertEVMChainIdToCoinType(optimism.id)
export const ARBITRUM_COIN = convertEVMChainIdToCoinType(arbitrum.id);
export const SOL_COIN = 501;

export const AVATAR_TEXT = "avatar";
export const NAME_TEXT = "name";
export const HEADER_TEXT = "header";
export const DESCRIPTION_TEXT = "description";
export const EMAIL_TEXT = "mail";
export const URL_TEXT = "url"
export const TWITTER_TEXT = "com.twitter";
export const DISCORD_TEXT = "com.discord";
export const TELEGRAM_TEXT = "org.telegram"
export const GITHUB_TEXT = "com.github";