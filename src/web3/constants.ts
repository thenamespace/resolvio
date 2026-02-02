import { parseAbi } from 'viem';
import { arbitrum, base, linea, mainnet, optimism, scroll } from 'viem/chains';

export const SUPPORTED_REVERSE_REGISTRAR_CHAINS: number[] = [
  mainnet.id,
  optimism.id,
  base.id,
  arbitrum.id,
  linea.id,
  scroll.id,
];

export const UNIVERSAL_RESOLVER_ADDRESS =
  '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe';

export const BATCH_GATEWAY_ABI = parseAbi([
  'struct Request {address sender; bytes[] urls; bytes data;}',
  'function query(Request[] requests) external returns (bool[] memory failures, bytes[] memory responses)',
]);

export const UNIVERSAL_RESOLVER_ABI = parseAbi([
  'error ResolverNotFound(bytes name)',
  'error ResolverNotContract(bytes name, address resolver)',
  'error UnsupportedResolverProfile(bytes4 selector)',
  'error ResolverError(bytes errorData)',
  'error ReverseAddressMismatch(string primary, bytes primaryAddress)',
  'error HttpError(uint16 status, string message)',
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
  'struct Request {address sender; string[] urls; bytes data;}',
  'function query(Request[] requests) external view returns (bool[] memory failures, bytes[] memory responses)',
  'function resolve(bytes name, bytes data) view returns (bytes result, address resolver)',
  'function reverse(bytes lookupAddress, uint256 coinType) view returns (string primary, address resolver, address reverseResolver)',
]);
