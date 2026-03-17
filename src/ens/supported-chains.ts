import {
  coinNameToTypeMap,
  getCoderByCoinName,
} from '@ensdomains/address-encoder';

export type SupportedChain = {
  coin: number;
  name: string;
  label: string;
};

/** Human-readable labels for well-known chains — use `Chain.eth`, `Chain.btc`, etc. */
export enum Chain {
  eth = 'eth',
  btc = 'btc',
  ltc = 'ltc',
  doge = 'doge',
  sol = 'sol',
  op = 'op',
  base = 'base',
  arb1 = 'arb1',
  matic = 'matic',
  avax = 'avax',
  bsc = 'bsc',
  ftm = 'ftm',
  cro = 'cro',
  atom = 'atom',
  celo = 'celo',
  dot = 'dot',
  near = 'near',
  apt = 'apt',
  sui = 'sui',
  linea = 'linea',
  scr = 'scr',
  zksync = 'zksync',
  xlm = 'xlm',
  xrp = 'xrp',
  ada = 'ada',
  trx = 'trx',
  algo = 'algo',
  xtz = 'xtz',
  fil = 'fil',
  icp = 'icp',
}

const CHAIN_LABELS: Record<string, string> = {
  [Chain.eth]: 'Ethereum',
  [Chain.btc]: 'Bitcoin',
  [Chain.ltc]: 'Litecoin',
  [Chain.doge]: 'Dogecoin',
  [Chain.sol]: 'Solana',
  [Chain.op]: 'Optimism',
  [Chain.base]: 'Base',
  [Chain.arb1]: 'Arbitrum One',
  [Chain.matic]: 'Polygon',
  [Chain.avax]: 'Avalanche',
  [Chain.bsc]: 'BNB Smart Chain',
  [Chain.ftm]: 'Fantom',
  [Chain.cro]: 'Cronos',
  [Chain.atom]: 'Cosmos',
  [Chain.celo]: 'Celo',
  [Chain.dot]: 'Polkadot',
  [Chain.near]: 'NEAR',
  [Chain.apt]: 'Aptos',
  [Chain.sui]: 'Sui',
  [Chain.linea]: 'Linea',
  [Chain.scr]: 'Scroll',
  [Chain.zksync]: 'zkSync Era',
  [Chain.xlm]: 'Stellar',
  [Chain.xrp]: 'XRP',
  [Chain.ada]: 'Cardano',
  [Chain.trx]: 'TRON',
  [Chain.algo]: 'Algorand',
  [Chain.xtz]: 'Tezos',
  [Chain.fil]: 'Filecoin',
  [Chain.icp]: 'Internet Computer',
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
