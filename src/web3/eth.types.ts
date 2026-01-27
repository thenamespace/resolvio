import { arbitrum, base, mainnet, optimism, scroll } from "viem/chains"

export type EthChain = "mainnet" | "base" | "optimism" | "scroll" | "arbitrum"

const EthChainIds: Record<number,EthChain> = {
    [mainnet.id]: "mainnet",
    [base.id]: "base",
    [optimism.id]: "optimism",
    [scroll.id]: "scroll",
    [arbitrum.id]: "arbitrum"
}

export const getEthChainById = (id: number): EthChain => {
    if (!EthChainIds[id]) {
        throw new Error(`Chain with id: ${id} cannot be found`)
    }
    return EthChainIds[id];
}