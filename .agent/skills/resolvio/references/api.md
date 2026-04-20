# Resolvio API Reference

**Base URL**: `https://api.resolvio.xyz`  
**Swagger UI**: `https://api.resolvio.xyz/api-docs`  
**OpenAPI JSON**: `https://api.resolvio.xyz/api-docs.json`

---

## Forward Resolution

### GET /ens/v2/profile/:name

Full ENS profile in a single RPC call. Default response includes 12 text keys, 8 chains, and contenthash.

**Path param**: `name` — ENS name (e.g. `vitalik.eth`)

**Query params**:

| Param         | Type    | Description                                                         |
| ------------- | ------- | ------------------------------------------------------------------- |
| `texts`       | string  | Comma-separated text record keys. Omit for defaults.                |
| `addresses`   | string  | Comma-separated chain names or coinType numbers. Omit for defaults. |
| `contenthash` | boolean | Include contenthash (default: `true`)                               |
| `noCache`     | boolean | Bypass in-memory cache                                              |

**Response**:

```json
{
  "name": "vitalik.eth",
  "resolver": "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
  "texts": [
    { "key": "avatar", "value": "https://...", "exists": true },
    { "key": "com.twitter", "exists": false }
  ],
  "addresses": [
    {
      "coin": 60,
      "chain": "eth",
      "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "exists": true
    },
    { "coin": 0, "chain": "btc", "exists": false }
  ],
  "contenthash": { "value": "ipfs://bafy...", "exists": true }
}
```

> `exists: false` records are always included. When `exists` is `false`, `value` is absent.

---

### GET /ens/v2/profile/bulk

Resolve profiles for multiple ENS names in parallel. Same query params as `/profile/:name`, applied uniformly to all names.

**Query params**:

| Param         | Type    | Required | Description                        |
| ------------- | ------- | -------- | ---------------------------------- |
| `names`       | string  | ✓        | Comma-separated ENS names. Max 20. |
| `texts`       | string  |          | Same as single profile             |
| `addresses`   | string  |          | Same as single profile             |
| `contenthash` | boolean |          | Same as single profile             |
| `noCache`     | boolean |          | Bypass cache                       |

**Response**: array of profile objects (same shape as single profile).

---

### GET /ens/v2/texts/:name

Fetch specific text records for an ENS name.

**Path param**: `name`

**Query params**:

| Param     | Type    | Required | Description                      |
| --------- | ------- | -------- | -------------------------------- |
| `keys`    | string  | ✓        | Comma-separated text record keys |
| `noCache` | boolean |          | Bypass cache                     |

**Response**:

```json
{
  "name": "vitalik.eth",
  "texts": [
    { "key": "avatar", "value": "https://...", "exists": true },
    { "key": "com.twitter", "exists": false }
  ]
}
```

**Common text keys**:

| Key            | Description         |
| -------------- | ------------------- |
| `avatar`       | Profile picture URL |
| `name`         | Display name        |
| `description`  | Bio                 |
| `url`          | Website             |
| `email`        | Email address       |
| `location`     | Location            |
| `com.twitter`  | Twitter/X handle    |
| `com.github`   | GitHub username     |
| `com.discord`  | Discord handle      |
| `org.telegram` | Telegram username   |
| `com.youtube`  | YouTube channel     |

---

### GET /ens/v2/addresses/:name

Fetch cryptocurrency addresses for an ENS name. Use `chains` **or** `coins`, not both.

**Path param**: `name`

**Query params**:

| Param     | Type    | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| `chains`  | string  | Comma-separated chain names (e.g. `eth,base,btc`)       |
| `coins`   | string  | Comma-separated coinType numbers (e.g. `60,2147492101`) |
| `noCache` | boolean | Bypass cache                                            |

**Response**:

```json
{
  "name": "vitalik.eth",
  "addresses": [
    {
      "coin": 60,
      "chain": "eth",
      "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "exists": true
    },
    { "coin": 0, "chain": "btc", "exists": false }
  ]
}
```

**Common chains**:

| Chain name | CoinType     | Network      |
| ---------- | ------------ | ------------ |
| `eth`      | `60`         | Ethereum     |
| `btc`      | `0`          | Bitcoin      |
| `sol`      | `501`        | Solana       |
| `base`     | `2147492101` | Base         |
| `op`       | `2147483658` | Optimism     |
| `arb1`     | `2147525809` | Arbitrum One |
| `matic`    | `2147483785` | Polygon      |

---

### GET /ens/v2/contenthash/:name

Resolve the content hash for an ENS name.

**Path param**: `name`

**Query params**: `noCache` (boolean, optional)

**Response**:

```json
{ "value": "ipfs://bafy...", "exists": true }
```

or

```json
{ "exists": false }
```

---

### GET /ens/v2/chains

Returns all supported chains with their name and coinType.

**Response**:

```json
[
  { "name": "eth", "coin": 60 },
  { "name": "btc", "coin": 0 },
  ...
]
```

Use `name` in `?chains=` params and `coin` in `?coins=` params — they refer to the same chain.

---

### DELETE /ens/v2/cache/:name

Clear cached records for an ENS name. Returns `204 No Content`.

**Path param**: `name`

**Query params**:

| Param  | Type   | Description                                                       |
| ------ | ------ | ----------------------------------------------------------------- |
| `type` | string | `texts` \| `addresses` \| `contenthash` \| `all` (default: `all`) |

---

## Reverse Resolution

### GET /ens/v2/reverse/:address

Resolve a single Ethereum address to its primary ENS name.

**Path param**: `address` — checksummed or lowercase Ethereum address

**Query params**: `noCache` (boolean, optional)

**Response (name found)**:

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "hasReverseRecord": true,
  "name": "vitalik.eth"
}
```

**Response (no name set)**:

```json
{
  "address": "0x225f137127d9067788314bc7fcc1f36746a3c3B5",
  "hasReverseRecord": false
}
```

---

### GET /ens/v2/reverse/bulk

Resolve multiple Ethereum addresses to their primary ENS names in a single batched RPC call.

**Query params**:

| Param       | Type    | Required | Description                                                              |
| ----------- | ------- | -------- | ------------------------------------------------------------------------ |
| `addresses` | string  | ✓        | Comma-separated Ethereum addresses. Max 20. Duplicates are deduplicated. |
| `noCache`   | boolean |          | Bypass cache                                                             |

**Response**:

```json
{
  "addresses": [
    {
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "hasReverseRecord": true,
      "name": "vitalik.eth"
    },
    {
      "address": "0x225f137127d9067788314bc7fcc1f36746a3c3B5",
      "hasReverseRecord": false
    }
  ]
}
```

---

## Error Responses

| Status | Meaning                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------ |
| `400`  | Invalid ENS name, invalid Ethereum address, unsupported chain, or too many items in bulk request |
| `204`  | Success for DELETE (cache clear)                                                                 |

---

## Cache Behaviour

| Type               | Default TTL | Bypass          |
| ------------------ | ----------- | --------------- |
| Forward resolution | 5 minutes   | `?noCache=true` |
| Reverse resolution | 30 minutes  | `?noCache=true` |

Cache is in-memory and resets on service restart. Items are cached individually — a cache hit on one key does not block fetching a miss on another.

---

## Limits

| Limit                                  | Value                   |
| -------------------------------------- | ----------------------- |
| Max names per bulk profile request     | 20                      |
| Max addresses per bulk reverse request | 20                      |
| Rate limiting                          | None currently enforced |
