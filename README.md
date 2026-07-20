<p align="center">
  <img src="assets/logo.svg" alt="Resolvio" width="320" />
</p>

<p align="center">
  ENS resolution API — forward and reverse, multi-chain, with per-item caching.
</p>

<p align="center">
  <a href="https://api.resolvio.xyz/api-docs">Swagger UI</a> ·
  <a href="https://api.resolvio.xyz/api-docs.json">OpenAPI JSON</a> ·
  <a href="https://t.me/namespace_eth">Telegram</a> ·
  <a href="https://twitter.com/namespace_eth">Twitter</a>
</p>

---

## What it does

- **Forward resolution** — ENS name → addresses (any chain), text records, content hash, full profile
- **Reverse resolution** — Ethereum address → primary ENS name, with bulk support
- **Multi-chain** — resolve addresses by chain name (`eth`, `base`, `btc`) or coinType number (`60`, `0`)
- **Per-item caching** — cache hits on individual keys don't block fetching misses
- **Single RPC call** — `/profile` fetches texts + addresses + contenthash in one request

---

## Quick start

```bash
cp .env.example .env   # fill in RPC_URL
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`.

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `RPC_URL` | Ethereum mainnet RPC endpoint | — (required) |
| `FORWARD_RESOLVE_CACHE_EXPIRY` | Forward cache TTL in seconds. `0` disables caching. | `300` |
| `REVERSE_RESOLVE_CACHE_EXPIRY` | Reverse cache TTL in seconds. `0` disables caching. | `1800` |
| `MAX_BULK_REVERSE_REQUEST` | Max addresses per bulk reverse request | `20` |
| `MAX_BULK_PROFILE_REQUEST` | Max names per bulk profile request | `20` |
| `ENABLE_DOCS` | Expose Swagger UI at `/api-docs` and OpenAPI JSON at `/api-docs.json` | `false` |
| `DEBUG_MODE` | Log request and response details at debug level | `false` |
| `IS_TESTNET` | Use ENS testnet registry | `false` |

---

## API

### Forward resolution

| Method | Path | Description |
|---|---|---|
| `GET` | `/ens/v2/profile/:name` | Full profile — texts, addresses, contenthash in one RPC call |
| `GET` | `/ens/v2/profile/bulk` | Profiles for multiple names in parallel |
| `GET` | `/ens/v2/texts/:name` | Text records |
| `GET` | `/ens/v2/addresses/:name` | Addresses by chain name or coinType |
| `GET` | `/ens/v2/contenthash/:name` | Content hash |
| `GET` | `/ens/v2/chains` | All supported chains with name and coinType |
| `DELETE` | `/ens/v2/cache/:name` | Clear cached records for a name |

### Reverse resolution

| Method | Path | Description |
|---|---|---|
| `GET` | `/ens/v2/reverse/:address` | Single address → ENS name |
| `GET` | `/ens/v2/reverse/:address/profile` | Verified reverse record → full ENS profile with convenience fields |
| `GET` | `/ens/v2/reverse/bulk` | Multiple addresses → ENS names (batched RPC call) |

---

## Usage examples

```bash
# Full default profile (12 text keys, 8 chains, contenthash)
curl https://api.resolvio.xyz/ens/v2/profile/vitalik.eth

# Custom selection
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth?texts=avatar,com.twitter&addresses=eth,base,btc&contenthash=false"

# Bulk profiles (up to 20 names)
curl "https://api.resolvio.xyz/ens/v2/profile/bulk?names=vitalik.eth,artii.eth"

# Addresses by chain name or coinType
curl "https://api.resolvio.xyz/ens/v2/addresses/vitalik.eth?chains=eth,base,btc"
curl "https://api.resolvio.xyz/ens/v2/addresses/vitalik.eth?coins=60,2147492101"

# Text records
curl "https://api.resolvio.xyz/ens/v2/texts/vitalik.eth?keys=avatar,description,com.twitter"

# Content hash
curl "https://api.resolvio.xyz/ens/v2/contenthash/vitalik.eth"

# Reverse resolve
curl "https://api.resolvio.xyz/ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

# Bulk reverse resolve (up to 20 addresses)
curl "https://api.resolvio.xyz/ens/v2/reverse/bulk?addresses=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5"

# Reverse resolve an address to its verified ENS profile
curl "https://api.resolvio.xyz/ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/profile"

# Custom profile selection (texts/addresses/contenthash) with cache bypass
curl "https://api.resolvio.xyz/ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/profile?texts=avatar,com.twitter&addresses=eth,base&contenthash=false&noCache=true"
```

### Reverse profile response

`GET /ens/v2/reverse/:address/profile` always returns HTTP 200 for valid addresses:

- `hasReverseRecord: false` — the address has no verified reverse record. `name`, `avatar`, `displayName`, `description`, and `profile` are `null`. The forward resolver is **not** called.
- `hasReverseRecord: true` — the address resolves to a verified ENS name. `name` is the primary name, `avatar`/`displayName`/`description` are extracted from the resolved text records (or `null` when those records are missing or not requested), and `profile` contains the full ENS profile payload.

The reverse lookup uses ENSJS `getName` with `allowMismatch` disabled by default, so only forward-verified names are returned. Upstream RPC/resolver errors are propagated unchanged.

All endpoints accept `?noCache=true` to bypass the in-memory cache.

---

## Deployment

**Production**: `https://api.resolvio.xyz`

```bash
docker build -t resolvio .
docker run -p 3000:3000 --env-file .env resolvio
```

---

## AI agent skill

The file [`.agent/skills/resolvio/SKILL.md`](.agent/skills/resolvio/SKILL.md) is an LLM-readable reference for this API — endpoints, parameters, response shapes, and key behaviours. Load it into any AI agent or MCP context to give it full Resolvio awareness.

---

## Tests

E2E tests make real network calls against ENS — no mocks.

```bash
npm run test:e2e
```

---

## Author

Built by [@nenadmitt](https://github.com/nenadmitt) · [Namespace](https://namespace.ninja)

[Telegram](https://t.me/namespace_eth) · [Twitter](https://twitter.com/namespace_eth)
