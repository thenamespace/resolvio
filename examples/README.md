# Examples

This directory contains example scripts demonstrating how to use the Resolvio API.

## Prerequisites

Make sure the API server is running:

```bash
# From the project root
npm run start:dev
```

The API should be available at `http://localhost:3001`.

## Running Examples

All examples use TypeScript and can be run with `ts-node` or `tsx`:

```bash
# Install ts-node globally (if not already installed)
npm install -g ts-node

# Or use tsx (faster)
npm install -g tsx
```

### Example 1: Resolve ENS Name

Resolve an ENS name to get its full profile (addresses, texts, contenthash):

```bash
ts-node examples/resolve-name.ts vitalik.eth
```

### Example 2: Reverse Resolution

Resolve Ethereum addresses to their primary ENS names:

```bash
# Single address
ts-node examples/reverse-resolve.ts 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

# Multiple addresses
ts-node examples/reverse-resolve.ts \
  0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 \
  0x225f137127d9067788314bc7fcc1f36746a3c3B5
```

## Using in Your Application

### Option 1: Direct HTTP Requests (any language)

```typescript
// TypeScript/JavaScript
const response = await fetch('http://localhost:3001/ens/v1/profile/vitalik.eth');
const profile = await response.json();
```

```python
# Python
import requests
response = requests.get('http://localhost:3001/ens/v1/profile/vitalik.eth')
profile = response.json()
```

### Option 2: With viem (TypeScript)

If you're already using viem in your project, you can combine it with this API:

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Use this API for on-chain resolution
const profile = await fetch('http://localhost:3001/ens/v1/profile/vitalik.eth')
  .then(r => r.json());

// Use viem for other blockchain operations
const client = createPublicClient({
  chain: mainnet,
  transport: http()
});
```

## API Endpoints Used

- `GET /ens/v1/profile/:name` - Get full ENS profile
- `GET /ens/v1/addresses/:name` - Get cryptocurrency addresses
- `GET /ens/v1/texts/:name` - Get text records
- `POST /ens/v1/reverse/bulk` - Bulk reverse resolution
- `POST /ens/v1/reverse/single/:address` - Single address reverse resolution

For complete API documentation, visit: http://localhost:3001/api/docs
