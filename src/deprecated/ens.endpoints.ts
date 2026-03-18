import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import {
  EnsProfile,
  EnsAddressRecord,
  EnsTextRecord,
  EnsMetadata,
} from '../ens/ens.types';
import { BulkReverseResolveResult } from '../ens/dto';

export const ENS_ENDPOINTS = {
  // Profile endpoint
  getEnsProfile: {
    operation: ApiOperation({
      summary: 'Get ENS Profile',
      description:
        'Retrieve comprehensive profile information for an ENS name including addresses, texts, and content hash',
    }),
    tags: ApiTags('Forward Resolution'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    query: ApiQuery({
      name: 'noCache',
      description: 'Skip cache and fetch fresh data',
      required: false,
      type: Boolean,
    }),
    response: ApiResponse({
      status: 200,
      description: 'ENS profile data retrieved successfully',
      type: EnsProfile,
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format',
    }),
    response404: ApiResponse({
      status: 404,
      description: 'ENS name not found or not registered',
    }),
  },

  // Addresses endpoint
  getEnsAddresses: {
    operation: ApiOperation({
      summary: 'Get ENS Addresses',
      description:
        'Retrieve cryptocurrency addresses associated with an ENS name',
    }),
    tags: ApiTags('Forward Resolution'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    query: ApiQuery({
      name: 'coins',
      description:
        'Array of coin types to retrieve (e.g., [60, 0] for ETH and BTC)',
      required: false,
      type: [Number],
    }),
    queryNoCache: ApiQuery({
      name: 'noCache',
      description: 'Skip cache and fetch fresh data',
      required: false,
      type: Boolean,
    }),
    response: ApiResponse({
      status: 200,
      description: 'ENS addresses retrieved successfully',
      type: [EnsAddressRecord],
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format or coin type',
    }),
    response404: ApiResponse({
      status: 404,
      description: 'ENS name not found or no addresses configured',
    }),
  },

  // Texts endpoint
  getEnsTexts: {
    operation: ApiOperation({
      summary: 'Get ENS Text Records',
      description:
        'Retrieve text records associated with an ENS name (e.g., avatar, description, keywords)',
    }),
    tags: ApiTags('Forward Resolution'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    query: ApiQuery({
      name: 'keys',
      description:
        'Array of text record keys to retrieve (e.g., ["avatar", "description"])',
      required: false,
      type: [String],
    }),
    queryNoCache: ApiQuery({
      name: 'noCache',
      description: 'Skip cache and fetch fresh data',
      required: false,
      type: Boolean,
    }),
    response: ApiResponse({
      status: 200,
      description: 'ENS text records retrieved successfully',
      type: [EnsTextRecord],
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format',
    }),
    response404: ApiResponse({
      status: 404,
      description: 'ENS name not found or no text records configured',
    }),
  },

  // Metadata endpoint
  getEnsMetadata: {
    operation: ApiOperation({
      summary: 'Get ENS Metadata',
      description:
        'Retrieve metadata information for an ENS name including ownership, expiry, and resolver details',
    }),
    tags: ApiTags('Forward Resolution'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    response: ApiResponse({
      status: 200,
      description: 'ENS metadata retrieved successfully',
      type: EnsMetadata,
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format',
    }),
    response404: ApiResponse({
      status: 404,
      description: 'ENS name not found or not registered',
    }),
  },

  // Contenthash endpoint
  getEnsContenthash: {
    operation: ApiOperation({
      summary: 'Get ENS Contenthash',
      description:
        'Retrieve the content hash associated with an ENS name (IPFS, IPNS, or other content identifiers)',
    }),
    tags: ApiTags('Forward Resolution'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    response: ApiResponse({
      status: 200,
      description: 'ENS content hash retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          contenthash: {
            type: 'string',
            description: 'Content hash value (IPFS hash, IPNS key, etc.)',
          },
        },
      },
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format',
    }),
    response404: ApiResponse({
      status: 404,
      description: 'ENS name not found or no content hash configured',
    }),
  },

  // Clear cache endpoint
  clearCache: {
    operation: ApiOperation({
      summary: 'Clear ENS Cache',
      description:
        'Clear cached data for a specific ENS name to force fresh resolution on next request',
    }),
    tags: ApiTags('ENS'),
    param: ApiParam({
      name: 'name',
      description: 'ENS name (e.g., "artii.eth")',
      example: 'artii.eth',
    }),
    response: ApiResponse({
      status: 200,
      description: 'Cache cleared successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Cache cleared for artii.eth',
          },
        },
      },
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid ENS name format',
    }),
  },

  // Bulk reverse resolve endpoint
  bulkReverseResolve: {
    operation: ApiOperation({
      summary: 'Bulk Reverse Resolve',
      description:
        'Resolve multiple Ethereum addresses to their primary ENS names in a single request',
    }),
    tags: ApiTags('Reverse Resolution'),
    body: ApiBody({
      description: 'Request containing array of addresses to reverse resolve',
      schema: {
        type: 'object',
        properties: {
          addresses: {
            type: 'array',
            items: { type: 'string' },
            example: [
              '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
              '0x225f137127d9067788314bc7fcc1f36746a3c3B5',
            ],
          },
          noCache: {
            type: 'boolean',
            description: 'Skip cache and fetch fresh data',
            default: false,
          },
        },
        required: ['addresses'],
      },
    }),
    response: ApiResponse({
      status: 200,
      description: 'Bulk reverse resolution completed successfully',
      type: BulkReverseResolveResult,
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid address format or empty address array',
    }),
  },

  // Single reverse resolve endpoint
  reverseResolve: {
    operation: ApiOperation({
      summary: 'Reverse Resolve Single Address',
      description: 'Resolve a single Ethereum address to its primary ENS name',
    }),
    tags: ApiTags('Reverse Resolution'),
    param: ApiParam({
      name: 'address',
      description:
        'Ethereum address (e.g., "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")',
      example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    }),
    response: ApiResponse({
      status: 200,
      description: 'Reverse resolution completed successfully',
      type: BulkReverseResolveResult,
    }),
    response400: ApiResponse({
      status: 400,
      description: 'Invalid Ethereum address format',
    }),
  },
};
