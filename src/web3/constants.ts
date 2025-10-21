import { parseAbi } from "viem"

export const UNIVERSAL_RESOLVER_ADDRESS = "0xaBd80E8a13596fEeA40Fd26fD6a24c3fe76F05fB"
export const UNIVERSAL_RESOLVER_ABI = parseAbi([
  'error ResolverNotFound(bytes name)',
  'error ResolverNotContract(bytes name, address resolver)',
  'error UnsupportedResolverProfile(bytes4 selector)',
  'error ResolverError(bytes errorData)',
  'error ReverseAddressMismatch(string primary, bytes primaryAddress)',
  'error HttpError(uint16 status, string message)',
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
  'function resolve(bytes name, bytes data) view returns (bytes result, address resolver)',
  'function reverse(bytes lookupAddress, uint256 coinType) view returns (string primary, address resolver, address reverseResolver)',
])