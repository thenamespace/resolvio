# Resolvio API — LLM Reference

Base URL: `https://api.resolvio.xyz`  
Swagger: `https://api.resolvio.xyz/api-docs`

---

## Forward Resolution

### GET /ens/v2/profile/:name

Resolves a full ENS profile in a single RPC call. Default response includes 12 text keys, 8 chains (eth, base, arb1, op, matic, celo, btc, sol), and contenthash.

```
GET /ens/v2/profile/vitalik.eth
```

Query params (all optional):
- `texts` — comma-separated text keys, e.g. `avatar,com.twitter`
- `addresses` — chain names or coinType numbers, e.g. `eth,base,60`
- `contenthash` — `true` or `false` (defaults to `true`)
- `noCache` — `true` bypasses the in-memory cache

Response shape:
```json
{
  "name": "vitalik.eth",
  "resolver": "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
  "texts": [
    { "key": "avatar", "value": "https://...", "exists": true },
    { "key": "com.twitter", "exists": false }
  ],
  "addresses": [
    { "coin": 60, "chain": "eth", "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "exists": true },
    { "coin": 0,  "chain": "btc", "exists": false }
  ],
  "contenthash": { "value": "ipfs://bafy...", "exists": true }
}
```

`exists: false` records are always included (no key is silently dropped). When `exists` is `false`, `value` is absent.

---

### GET /ens/v2/texts/:name

Fetch specific text records only.

```
GET /ens/v2/texts/vitalik.eth?keys=avatar,description,com.twitter,url
```

Required: `keys` (comma-separated).

Response:
```json
{
  "name": "vitalik.eth",
  "texts": [
    { "key": "avatar", "value": "https://...", "exists": true },
    { "key": "com.twitter", "exists": false }
  ]
}
```

---

### GET /ens/v2/addresses/:name

Fetch addresses by chain name or coinType.

```
GET /ens/v2/addresses/vitalik.eth?chains=eth,base,btc,sol
GET /ens/v2/addresses/vitalik.eth?coins=60,2147492101
```

Use `chains` (human names) **or** `coins` (coinType integers), not both.

Response:
```json
{
  "name": "vitalik.eth",
  "addresses": [
    { "coin": 60, "chain": "eth", "value": "0xd8dA...", "exists": true },
    { "coin": 0,  "chain": "btc", "exists": false }
  ]
}
```

---

### GET /ens/v2/contenthash/:name

```
GET /ens/v2/contenthash/vitalik.eth
```

Response:
```json
{ "value": "ipfs://bafybeid...", "exists": true }
```

or `{ "exists": false }` when no contenthash is set.

---

### GET /ens/v2/chains

Lists all supported chains with their coinType and human-readable name.

```
GET /ens/v2/chains
```

Response:
```json
[
  { "coin": 60,  "name": "eth",  "label": "Ethereum" },
  { "coin": 0,   "name": "btc",  "label": "Bitcoin" },
  { "coin": 2147492101, "name": "base", "label": "Base" }
]
```

Use `name` values in `?chains=` params. Use `coin` values in `?coins=` params. Both refer to the same chain.

---

### DELETE /ens/v2/cache/:name

Clears in-memory cache for a name. Accepts optional `?type=texts|addresses|all`.

```
DELETE /ens/v2/cache/vitalik.eth
DELETE /ens/v2/cache/vitalik.eth?type=texts
```

---

## Reverse Resolution

### GET /ens/v2/reverse/:address

Resolves a single Ethereum address to its primary ENS name.

```
GET /ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Response when found:
```json
{ "address": "0xd8dA...", "hasReverseRecord": true, "name": "vitalik.eth" }
```

Response when not found:
```json
{ "address": "0x0000...", "hasReverseRecord": false }
```

---

### GET /ens/v2/reverse/bulk

Resolves multiple addresses in one batched RPC call. Addresses are comma-separated in the `addresses` query param. Default max: 20.

```
GET /ens/v2/reverse/bulk?addresses=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5
```

Response:
```json
{
  "addresses": [
    { "address": "0xd8dA...", "hasReverseRecord": true,  "name": "vitalik.eth" },
    { "address": "0x225f...", "hasReverseRecord": false }
  ]
}
```

---

## Key behaviours

- **Always returns all requested records.** A missing record is `{ exists: false }`, never omitted.
- **Caching is per-item.** A cache hit on some keys does not block fetching missed keys.
- **Profile is one RPC call.** Prefer `/profile` over combining separate endpoints.
- **Chain names and coinTypes are interchangeable** in address queries. Use `/ens/v2/chains` to discover them.
- **Reverse bulk deduplicates** input addresses before resolving.
