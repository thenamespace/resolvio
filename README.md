# Resolvio — Name Resolver API 

ENS resolution service built with [NestJS](https://nestjs.com/).

Swagger UI: [api.resolvio.xyz/api-docs](https://api.resolvio.xyz/api-docs)

---

## What it resolves

### Forward resolution — name → records

| Capability | Endpoint | Notes |
|---|---|---|
| Text records | `GET /ens/v2/texts/:name` | Any ENS text key (avatar, bio, socials, …) |
| Addresses | `GET /ens/v2/addresses/:name` | Any chain by name or coinType |
| Content hash | `GET /ens/v2/contenthash/:name` | IPFS, Arweave, Swarm, … |
| Full profile | `GET /ens/v2/profile/:name` | All of the above in a single RPC call |
| Supported chains | `GET /ens/v2/chains` | Lists all chain names + coinTypes |
| Clear cache | `DELETE /ens/v2/cache/:name` | Evicts cached records for a name |

**Default profile** (no query params): 12 text keys × 8 chains (eth, base, arb1, op, matic, celo, btc, sol) + contenthash.

### Reverse resolution — address → name

| Capability | Endpoint | Notes |
|---|---|---|
| Single address | `GET /ens/v2/reverse/:address` | Returns primary ENS name |
| Bulk addresses | `GET /ens/v2/reverse/bulk?addresses=` | Up to `MAX_BULK_REVERSE_REQUEST` addresses, comma-separated |

---

## Quick start

```bash
cp .env.example .env   # fill in RPC_URL
npm install
npm run start:dev
```

---

## Example requests

```bash
# Full default profile
curl https://api.resolvio.xyz/ens/v2/profile/artii.eth

# Custom selection — specific texts, chains, and contenthash
curl "https://api.resolvio.xyz/ens/v2/profile/artii.eth?texts=avatar,com.twitter&addresses=eth,base,btc&contenthash=true"

# Addresses by chain name or coinType
curl "https://api.resolvio.xyz/ens/v2/addresses/artii.eth?chains=eth,base,btc"
curl "https://api.resolvio.xyz/ens/v2/addresses/artii.eth?coins=60,2147492101"

# Individual text records
curl "https://api.resolvio.xyz/ens/v2/texts/artii.eth?keys=avatar,description,url"

# Content hash
curl "https://api.resolvio.xyz/ens/v2/contenthash/artii.eth"

# Reverse resolve
curl "https://api.resolvio.xyz/ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

# Bulk reverse resolve
curl "https://api.resolvio.xyz/ens/v2/reverse/bulk?addresses=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5"
```

---

## Configuration

| Variable | Description | Default |
|---|---|---|
| `RPC_URL` | Ethereum mainnet RPC URL | — (required) |
| `FORWARD_RESOLVE_CACHE_EXPIRY` | Forward cache TTL in seconds (`0` = disabled) | `300` |
| `REVERSE_RESOLVE_CACHE_EXPIRY` | Reverse cache TTL in seconds (`0` = disabled) | `1800` |
| `MAX_BULK_REVERSE_REQUEST` | Max addresses per bulk reverse request | `20` |
| `ENABLE_DOCS` | Expose Swagger UI at `/api-docs` | `false` |
| `DEBUG_MODE` | Enable debug-level request/response logs | `false` |
| `IS_TESTNET` | Use testnet ENS registry | `false` |

---

## Tests

```bash
npm run test:e2e
```

E2E tests make real network calls against ENS — no mocks.
