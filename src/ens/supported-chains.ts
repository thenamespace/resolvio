import {
  coinNameToTypeMap,
  getCoderByCoinName,
} from '@ensdomains/address-encoder';

export type SupportedChain = {
  coin: number;
  name: string;
  label: string;
};

// Human-readable labels for well-known chains.
// Falls back to uppercased name for everything else.
const CHAIN_LABELS: Record<string, string> = {
  eth: 'Ethereum',
  btc: 'Bitcoin',
  ltc: 'Litecoin',
  doge: 'Dogecoin',
  sol: 'Solana',
  op: 'Optimism',
  base: 'Base',
  arb1: 'Arbitrum One',
  matic: 'Polygon',
  avax: 'Avalanche',
  bsc: 'BNB Smart Chain',
  ftm: 'Fantom',
  cro: 'Cronos',
  atom: 'Cosmos',
  celo: "Celo",
  dot: 'Polkadot',
  near: 'NEAR',
  apt: 'Aptos',
  sui: 'Sui',
  linea: 'Linea',
  scr: 'Scroll',
  zksync: 'zkSync Era',
  xlm: 'Stellar',
  xrp: 'XRP',
  ada: 'Cardano',
  trx: 'TRON',
  algo: 'Algorand',
  xtz: 'Tezos',
  fil: 'Filecoin',
  icp: 'Internet Computer',
};

function buildSupportedChains(): SupportedChain[] {
  const chains: SupportedChain[] = [];

  for (const name of Object.keys(coinNameToTypeMap)) {
    try {
      const coder = getCoderByCoinName(name);
      chains.push({
        coin: coder.coinType,
        name: coder.name,
        label: CHAIN_LABELS[coder.name] ?? coder.name.toUpperCase(),
      });
    } catch {
      // skip unsupported coders
    }
  }

  return chains.sort((a, b) => a.coin - b.coin);
}

// Built once at module load — the list is static
export const SUPPORTED_CHAINS: SupportedChain[] = buildSupportedChains();

export function coinTypeForChain(name: string): number | null {
  try {
    return getCoderByCoinName(name).coinType;
  } catch {
    return null;
  }
}

// Reverse lookup: coin type → chain name (e.g. 60 → 'eth')
const coinToChainName = new Map<number, string>(
  SUPPORTED_CHAINS.map((c) => [c.coin, c.name]),
);

export function chainNameForCoin(coin: number): string | undefined {
  return coinToChainName.get(coin);
}
