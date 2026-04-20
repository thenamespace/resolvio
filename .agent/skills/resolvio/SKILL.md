---
name: resolvio
description: Resolves ENS names to addresses, fetches ENS profile and text records, reverse-resolves addresses to ENS names, and batch-resolves ENS names for leaderboards or tables via Resolvio HTTP endpoints. Use when users ask for ENS lookup, reverse lookup, profile data, or bulk ENS resolution.
---

# Resolvio ENS Resolution API

**Base URL**: `https://api.resolvio.xyz`  
**OpenAPI JSON**: `https://api.resolvio.xyz/api-docs.json`

No authentication required.

---

## Route map

| Task | Route | Notes |
| --- | --- | --- |
| ENS name -> one or more chain addresses | `GET /ens/v2/addresses/:name` | Use `chains` or `coins`, not both |
| Full profile (texts + addresses + contenthash) | `GET /ens/v2/profile/:name` | Prefer this over multiple separate calls |
| Multiple profiles | `GET /ens/v2/profile/bulk` | Max 20 names per call |
| Text records only | `GET /ens/v2/texts/:name` | Pass `keys=` list |
| Contenthash only | `GET /ens/v2/contenthash/:name` | Returns `{ exists: false }` when unset |
| Reverse lookup for one address | `GET /ens/v2/reverse/:address` | Returns `hasReverseRecord` |
| Reverse lookup for many addresses | `GET /ens/v2/reverse/bulk` | Max 20 addresses per call; do not loop single calls |
| List supported chains + coinTypes | `GET /ens/v2/chains` | Chain names and coinTypes are equivalent |
| Cache management | `GET ...?noCache=true`, `DELETE /ens/v2/cache/:name` | Use only when fresh data is needed |

---

## Core rules

- All requested records are returned. Missing records appear as `{ "exists": false }` and are not silently dropped.
- Always check `exists` before reading `value`.
- Use bulk endpoints for lists. Max 20 items per bulk request; batch larger sets in chunks of 20.
- For cache, only use `?noCache=true` or cache clear when fresh data is required.

---

## Output shapes (quick reference)

- `GET /ens/v2/addresses/:name` -> `{ name, addresses: [{ coin, chain, exists, value? }] }`
- `GET /ens/v2/profile/:name` -> `{ name, resolver?, texts: [{ key, exists, value? }], addresses: [{ coin, chain, exists, value? }], contenthash: { exists, value? } }`
- `GET /ens/v2/reverse/:address` -> `{ address, hasReverseRecord, name? }`
- `GET /ens/v2/reverse/bulk` -> `{ addresses: [{ address, hasReverseRecord, name? }] }`
- `GET /ens/v2/texts/:name` -> `{ name, texts: [{ key, exists, value? }] }`
- `GET /ens/v2/contenthash/:name` -> `{ exists, value? }`
- `GET /ens/v2/chains` -> `[{ name, coin }]`

`value` and `name` are optional and omitted when `exists: false` or `hasReverseRecord: false`.

---

## Error handling

- Expect `400` for invalid ENS names, invalid addresses, unsupported chains, or bulk requests over limit.
- When a lookup does not exist, treat it as a valid empty result (`exists: false` or `hasReverseRecord: false`), not a transport failure.

---

## Minimal examples

### Name -> ETH address

```bash
curl "https://api.resolvio.xyz/ens/v2/addresses/vitalik.eth?chains=eth"
```

### Profile with selected fields

```bash
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth?texts=avatar,description,com.twitter&addresses=eth,base&contenthash=false"
```

### Bulk reverse for leaderboard rows

```bash
curl "https://api.resolvio.xyz/ens/v2/reverse/bulk?addresses=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5"
```

### Fresh read after update

```bash
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth?noCache=true"
```

---

## References

- Full API reference (params, response shapes, errors): [references/api.md](references/api.md)
- Concise usage examples by workflow: [references/examples.md](references/examples.md)
