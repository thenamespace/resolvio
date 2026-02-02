# Resolvio

A simple-to-use resolution service built to unify all web3 naming services under one API for simple data fetching and resolution (built with [NestJS](https://nestjs.com/)).

**Production**: https://resolvio.namespace.ninja/  
**API Docs**: https://resolvio.namespace.ninja/api/docs  
**Documentation**: https://docs.namespace.ninja/api-reference/resolvio/

## Description

Resolvio provides a comprehensive REST API for **Ethereum Name Service (ENS)** resolution. The service offers a unified interface for resolving ENS names, performing reverse lookups, and fetching profile data including addresses, text records, and contenthash.

## Features

- **ENS Resolution**: Complete support for Ethereum Name Service
  - Forward resolution (name → address)
  - Reverse resolution (address → name)
  - Profile data (texts, addresses, contenthash)
  - Multi-chain support (ETH, BTC, SOL, OP, Base, ARB)
- **RESTful API**: Clean, consistent API endpoints with OpenAPI documentation
- **TypeScript**: Built with TypeScript for type safety and better DX
- **Caching**: In-memory caching for improved performance
- **Docker Support**: Containerized deployment ready

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Alchemy API key (for Ethereum RPC access)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd universal-resolution-service

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Create a `.env` file in the project root:

```bash
# Server port (default: 3000)
PORT=3001

# Alchemy API token for Ethereum RPC access
# Get yours at: https://www.alchemy.com/
ALCHEMY_TOKEN=your_alchemy_api_key_here
```

### Running the Service

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Using Docker
docker build -t universal-resolution-service .
docker run -p 3001:3001 --env-file .env universal-resolution-service
```

The API will be available at `http://localhost:3001`

## API Documentation

**Production**:
- **Swagger UI**: https://resolvio.namespace.ninja/api/docs
- **Documentation**: https://docs.namespace.ninja/api-reference/resolvio/
- **OpenAPI JSON**: https://resolvio.namespace.ninja/api/openapi.json

**Local Development**:
- **Swagger UI**: http://localhost:3001/api/docs
- **OpenAPI JSON**: http://localhost:3001/api/openapi.json

### Quick API Examples

#### Forward Resolution - Get ENS Profile

```bash
# Production
curl https://resolvio.namespace.ninja/ens/v1/profile/vitalik.eth

# Local
curl http://localhost:3001/ens/v1/profile/vitalik.eth
```

Response:
```json
{
  "name": "vitalik.eth",
  "addresses": [
    { "coin": 60, "name": "eth", "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" }
  ],
  "texts": [
    { "key": "avatar", "value": "..." }
  ],
  "resolver": "0x..."
}
```

#### Reverse Resolution - Address to Name

```bash
curl -X POST http://localhost:3001/ens/v1/reverse/bulk \
  -H "Content-Type: application/json" \
  -d '{"addresses": ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"]}'
```

Response:
```json
{
  "result": [
    {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "name": "vitalik.eth",
      "hasReverseRecord": true
    }
  ]
}
```

#### Get Specific Text Records

```bash
curl "http://localhost:3001/ens/v1/texts/vitalik.eth?keys[]=avatar&keys[]=com.twitter"
```

#### Get Multi-Chain Addresses

```bash
curl "http://localhost:3001/ens/v1/addresses/vitalik.eth?coins[]=60&coins[]=0&coins[]=501"
```

## Architecture

### Directory Structure

```
src/
├── ens/                    # ENS-specific resolution logic
│   ├── ens.controller.ts   # API endpoints
│   ├── ens.resolver.ts     # Forward resolution service
│   ├── ens-reverse.resolver.ts  # Reverse resolution service
│   ├── in-memory-ens.cache.ts   # Caching layer
│   └── dto/                # Data transfer objects
├── resolver/               # Generic resolver interface
├── web3/                   # Blockchain clients (viem, ensjs)
├── docs/                   # API documentation configs
└── main.ts                # Application entry point
```

### Key Components

- **ENS Resolver**: Handles forward resolution using `@ensdomains/ensjs`
- **Reverse Resolver**: Handles address-to-name resolution
- **Cache Layer**: In-memory cache with 5-minute TTL
- **Web3 Clients**: Viem-based clients for Ethereum, Base, Optimism
- **Swagger Docs**: Auto-generated API documentation

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Build with frontend (if applicable)
npm run build:all
```



This project is in active development. Contributions and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
