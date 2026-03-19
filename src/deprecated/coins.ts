import { convertEVMChainIdToCoinType } from './ens.utils';

export enum ChainName {
  Ethereum = 'eth',
  Solana = 'sol',
  Arbitrum = 'arb',
  Optimism = 'op',
  Base = 'base',
  Polygon = 'polygon',
  Bsc = 'bsc',
  Avalanche = 'avax',
  Gnosis = 'gnosis',
  ZkSync = 'zksync',
  Cosmos = 'cosmos',
  Near = 'near',
  Linea = 'linea',
  Scroll = 'scroll',
  Btc = 'btc',
  Starknet = 'starknet',
  Unichain = 'unichain',
  Sui = 'sui',
  Berachain = 'berachain',
  WorldChain = 'world_chain',
  Zora = 'zora',
  Celo = 'celo',
  Aptos = 'aptos',
  Algorand = 'algorand',
}

export interface Blockchain {
  name: string;
  chain_id: number;
  coin_type: number;
}

export enum ChainIds {
  Ethereum = 1,
  Base = 8453,
  Optimism = 10,
  Arbitrum = 42161,
  Bsc = 56,
  Polygon = 137,
  Avalanche = 43114,
  Gnosis = 100,
  ZkSync = 324,
  Starknet = 9004,
  Solana = 501,
  Btc = 0,
  Cosmos = 118,
  Near = 397,
  Linea = 59144,
  Scroll = 534532,
  Unichain = 130,
  Sui = 101,
  Berachain = 80094,
  WorldChain = 480,
  Zora = 7777777,
  Celo = 42220,
  Aptos = 22,
  Algorand = 8,
}

export const Blockchains: Record<ChainName, Blockchain> = {
  // EVM (coin_type via helper)
  [ChainName.Ethereum]: {
    name: 'Ethereum',
    chain_id: ChainIds.Ethereum,
    coin_type: 60,
  },
  [ChainName.Arbitrum]: {
    name: 'Arbitrum One',
    chain_id: ChainIds.Arbitrum,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Arbitrum),
  },
  [ChainName.Optimism]: {
    name: 'Optimism',
    chain_id: ChainIds.Optimism,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Optimism),
  },
  [ChainName.Base]: {
    name: 'Base',
    chain_id: ChainIds.Base,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Base),
  },
  [ChainName.Polygon]: {
    name: 'Polygon',
    chain_id: ChainIds.Polygon,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Polygon),
  },
  [ChainName.Avalanche]: {
    name: 'Avalanche C-Chain',
    chain_id: ChainIds.Avalanche,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Avalanche),
  },
  [ChainName.Gnosis]: {
    name: 'Gnosis Chain',
    chain_id: ChainIds.Gnosis,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Gnosis),
  },
  [ChainName.ZkSync]: {
    name: 'ZkSync Era',
    chain_id: ChainIds.ZkSync,
    coin_type: convertEVMChainIdToCoinType(ChainIds.ZkSync),
  },
  [ChainName.Linea]: {
    name: 'Linea',
    chain_id: ChainIds.Linea,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Linea),
  },
  [ChainName.Scroll]: {
    name: 'Scroll',
    chain_id: ChainIds.Scroll,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Scroll),
  },
  [ChainName.Unichain]: {
    name: 'Unichain',
    chain_id: ChainIds.Unichain,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Unichain),
  },
  [ChainName.Berachain]: {
    name: 'Berachain',
    chain_id: ChainIds.Berachain,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Berachain),
  },
  [ChainName.WorldChain]: {
    name: 'World Chain',
    chain_id: ChainIds.WorldChain,
    coin_type: convertEVMChainIdToCoinType(ChainIds.WorldChain),
  },
  [ChainName.Zora]: {
    name: 'Zora',
    chain_id: ChainIds.Zora,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Zora),
  },
  [ChainName.Celo]: {
    name: 'Celo',
    chain_id: ChainIds.Celo,
    coin_type: convertEVMChainIdToCoinType(ChainIds.Celo),
  },

  // EVM with unique SLIP-0044
  [ChainName.Bsc]: {
    name: 'BNB Smart Chain',
    chain_id: ChainIds.Bsc,
    coin_type: 714,
  },

  // Non-EVM (explicit SLIP-0044)
  [ChainName.Btc]: { name: 'Bitcoin', chain_id: ChainIds.Btc, coin_type: 0 },
  [ChainName.Solana]: {
    name: 'Solana',
    chain_id: ChainIds.Solana,
    coin_type: 501,
  },
  [ChainName.Cosmos]: {
    name: 'Cosmos Hub',
    chain_id: ChainIds.Cosmos,
    coin_type: 118,
  },
  [ChainName.Near]: { name: 'Near', chain_id: ChainIds.Near, coin_type: 397 },
  [ChainName.Sui]: { name: 'Sui', chain_id: ChainIds.Sui, coin_type: 784 },
  [ChainName.Aptos]: {
    name: 'Aptos',
    chain_id: ChainIds.Aptos,
    coin_type: 637,
  },
  [ChainName.Algorand]: {
    name: 'Algorand',
    chain_id: ChainIds.Algorand,
    coin_type: 283,
  },

  // Starknet (non-EVM; using SLIP-0044 coin type)
  [ChainName.Starknet]: {
    name: 'Starknet',
    chain_id: ChainIds.Starknet,
    coin_type: 9004,
  },
};

// Fast lookup by chain_id
const _byChainId = new Map<number, Blockchain>(
  Object.values(Blockchains).map((b) => [b.chain_id, b]),
);

export function getBlockchainByChainId(
  chain_id: number,
): Blockchain | undefined {
  return _byChainId.get(chain_id);
}
