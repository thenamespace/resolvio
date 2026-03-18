# Name Resolver API

ENS resolution service built with [NestJS](https://nestjs.com/). Resolves names to addresses, text records, and content hashes — with reverse resolution, multi-chain support, and per-item in-memory caching.

---

## Quick start

```bash
cp .env.example .env   # set ETH_RPC_URL + cache config
npm install
npm run start:dev
```

Swagger UI: `http://localhost:3000/api` (requires `ENABLE_DOCS=true`)

---

## V2 API

### Forward resolution — `/ens/v2`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ens/v2/chains` | Supported chains |
| `GET` | `/ens/v2/texts/:name` | Text records |
| `GET` | `/ens/v2/addresses/:name` | Addresses |
| `GET` | `/ens/v2/contenthash/:name` | Content hash |
| `GET` | `/ens/v2/profile/:name` | Full profile (single RPC call) |
| `DELETE` | `/ens/v2/cache/:name` | Clear cached records |

**Profile** — no params = default profile (12 text keys, 8 chains: eth, base, arb1, op, matic, celo, btc, sol).

```bash
# Full default profile
curl http://localhost:3000/ens/v2/profile/artii.eth

# Custom selection
curl "http://localhost:3000/ens/v2/profile/artii.eth?texts=avatar,com.twitter&addresses=eth,base,btc&contenthash=true"

# Addresses for specific chains
curl "http://localhost:3000/ens/v2/addresses/artii.eth?chains=eth,base,btc"

# Text records
curl "http://localhost:3000/ens/v2/texts/artii.eth?keys=avatar,description,url"
```

### Reverse resolution — `/ens/v2/reverse`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ens/v2/reverse/:address` | Single address → ENS name |
| `GET` | `/ens/v2/reverse/bulk?addresses=` | Bulk (comma-separated addresses) |

```bash
curl http://localhost:3000/ens/v2/reverse/0x179A862703a4adfb29896552DF9e307980D19285
curl "http://localhost:3000/ens/v2/reverse/bulk?addresses=0x179A...,0x231b..."
```

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ETH_RPC_URL` | Ethereum mainnet RPC URL | — |
| `FORWARD_RESOLVE_CACHE_EXPIRY` | Forward cache TTL ms (`0` = off) | `300000` |
| `REVERSE_RESOLVE_CACHE_EXPIRY` | Reverse cache TTL ms (`0` = off) | `300000` |
| `MAX_BULK_REVERSE_REQUEST` | Max addresses per bulk request | `50` |
| `ENABLE_DOCS` | Expose Swagger UI at `/api` | `false` |

---

## Tests

```bash
npm run test:e2e
```

E2E tests make real network calls against ENS — no mocks.

---

## MCP Server (suggested)

Exposing this service as an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server would let AI assistants like Claude directly resolve ENS names as part of a conversation, no copy-pasting needed.

### Setup

```bash
npm install @modelcontextprotocol/sdk zod
```

Create `src/mcp/mcp.controller.ts`:

```typescript
import { Controller, Post, Req, Res } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { EnsForwardResolver } from 'src/ens/ens.forward-resolver';
import { EnsReverseResolverV2 } from 'src/ens/ens.reverse-resolver';
import { z } from 'zod';

@Controller('/mcp')
export class McpController {
  constructor(
    private readonly forward: EnsForwardResolver,
    private readonly reverse: EnsReverseResolverV2,
  ) {}

  @Post()
  async handle(@Req() req: any, @Res() res: any) {
    const server = new McpServer({ name: 'name-resolver', version: '1.0.0' });

    server.tool(
      'resolve_profile',
      'Resolve a full ENS profile — texts, addresses, and optional contenthash',
      {
        name: z.string().describe('ENS name, e.g. artii.eth'),
        chains: z.string().optional().describe('Comma-separated chain names, e.g. eth,base,btc'),
        texts: z.string().optional().describe('Comma-separated text keys, e.g. avatar,com.twitter'),
        contenthash: z.boolean().optional().describe('Include content hash'),
      },
      async ({ name, chains, texts, contenthash }) => {
        const profile = await this.forward.resolveProfile(name, {
          addresses: chains?.split(','),
          texts: texts?.split(','),
          contenthash,
        });
        return { content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }] };
      },
    );

    server.tool(
      'resolve_address',
      'Resolve ENS addresses for specific chains',
      {
        name: z.string().describe('ENS name'),
        chains: z.string().optional().describe('Comma-separated chains, e.g. eth,base,btc'),
      },
      async ({ name, chains }) => {
        const result = await this.forward.resolveAddresses(name, {
          chains: chains?.split(','),
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      },
    );

    server.tool(
      'reverse_resolve',
      'Resolve an Ethereum address to its primary ENS name',
      { address: z.string().describe('0x Ethereum address') },
      async ({ address }) => {
        const result = await this.reverse.resolveOne(address as `0x${string}`);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      },
    );

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
```

Register `McpController` in `AppModule`. Then connect from Claude Desktop:

```json
{
  "mcpServers": {
    "ens": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Suggested tools

| Tool | What it enables |
|------|----------------|
| `resolve_profile` | Full ENS profile in one shot |
| `resolve_address` | Addresses for specific chains |
| `resolve_text` | Individual text records (avatar, bio, socials) |
| `reverse_resolve` | Address → ENS name lookup |
| `bulk_reverse_resolve` | Resolve many addresses at once |

---

## License

MIT
