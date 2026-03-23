---
name: Resolvio
description: Interact with Resolvio - an ENS resolution API. Resolve ENS names to addresses/texts/contenthash, bulk-resolve profiles, and reverse-resolve addresses to names.
---

# Resolvio API Skill

**Base URL**: `https://api.resolvio.xyz`  
**Swagger**: `https://api.resolvio.xyz/api-docs`  
**OpenAPI JSON**: `https://api.resolvio.xyz/api-docs.json`

---

## Forward Resolution

### GET /ens/v2/profile/:name

Full ENS profile in a single RPC call. Default response includes 12 text keys, 8 chains, and contenthash.

```
GET /ens/v2/profile/vitalik.eth
```

Optional query params:
- `texts` — comma-separated text keys, e.g. `avatar,com.twitter`
- `addresses` — chain names or coinType numbers, e.g. `eth,base,60`
- `contenthash` — `true` or `false` (default: `true`)
- `noCache` — `true` bypasses in-memory cache

Response:
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

`exists: false` records are always returned — no key is silently dropped. When `exists` is `false`, `value` is absent.

---

### GET /ens/v2/profile/bulk

Resolve profiles for multiple names in parallel. Accepts the same query params as `/profile/:name`, applied uniformly to all names. Default max: 20 names.

```
GET /ens/v2/profile/bulk?names=vitalik.eth,artii.eth
```

Required: `names` (comma-separated, max 20).

Response: array of profile objects (same shape as single profile).

**Tip**: Always prefer bulk over sequential single-profile calls when resolving more than one name.

---

### GET /ens/v2/texts/:name

Fetch specific text records only.

```
GET /ens/v2/texts/vitalik.eth?keys=avatar,description,com.twitter
```

Required: `keys` (comma-separated).

Common keys: `avatar`, `name`, `description`, `url`, `email`, `location`, `com.twitter`, `com.github`, `com.discord`, `org.telegram`, `com.youtube`

---

### GET /ens/v2/addresses/:name

Fetch addresses by chain name or coinType. Use `chains` **or** `coins`, not both.

```
GET /ens/v2/addresses/vitalik.eth?chains=eth,base,btc,sol
GET /ens/v2/addresses/vitalik.eth?coins=60,2147492101
```

Common chains: `eth` (60), `btc` (0), `sol` (501), `base` (2147492101), `op` (2147483658), `arb1` (2147525809), `matic` (2147483785)

Use `GET /ens/v2/chains` to get the full list with both name and coinType.

---

### GET /ens/v2/contenthash/:name

```
GET /ens/v2/contenthash/vitalik.eth
```

Response: `{ "value": "ipfs://bafy...", "exists": true }` or `{ "exists": false }`.

---

### GET /ens/v2/chains

Lists all supported chains with `coin` (coinType integer) and `name` (chain string). Use `name` in `?chains=` params and `coin` in `?coins=` params — they refer to the same chain.

---

### DELETE /ens/v2/cache/:name

Clears cached records for a name. Optional `?type=texts|addresses|all`.

---

## Reverse Resolution

### GET /ens/v2/reverse/:address

Resolve a single address to its primary ENS name.

```
GET /ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Response when found: `{ "address": "0xd8dA...", "hasReverseRecord": true, "name": "vitalik.eth" }`  
Response when not found: `{ "address": "0x...", "hasReverseRecord": false }`

---

### GET /ens/v2/reverse/bulk

Resolve multiple addresses in one batched RPC call. Default max: 20 addresses.

```
GET /ens/v2/reverse/bulk?addresses=0xd8dA...,0x225f...
```

Required: `addresses` (comma-separated, max 20). Duplicates are deduplicated automatically.

Response:
```json
{
  "addresses": [
    { "address": "0xd8dA...", "hasReverseRecord": true,  "name": "vitalik.eth" },
    { "address": "0x225f...", "hasReverseRecord": false }
  ]
}
```

**Tip**: Always use bulk when resolving more than one address — it batches the RPC call.

---

## Key behaviours

- **Always returns all requested records.** A missing record is `{ exists: false }`, never omitted.
- **Profile is one RPC call.** Prefer `/profile` over combining separate endpoints.
- **Bulk profile resolves concurrently.** Max 20 names per request.
- **Bulk reverse deduplicates** input addresses before resolving.
- **Cache is per-item, TTL ~5 min.** Bypass with `?noCache=true`.
- **Chain names and coinTypes are interchangeable.** Use `/ens/v2/chains` to discover them.
