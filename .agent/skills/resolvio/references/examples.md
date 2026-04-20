# Resolvio Usage Examples

All examples use `https://api.resolvio.xyz` as the base URL.

---

## Core workflows

### Resolve name to one or more addresses

```bash
# Name -> ETH address
curl "https://api.resolvio.xyz/ens/v2/addresses/vitalik.eth?chains=eth"

# Name -> ETH + Base + BTC
curl "https://api.resolvio.xyz/ens/v2/addresses/vitalik.eth?chains=eth,base,btc"
```

Check each returned item with `exists` before using `value`.

---

### Fetch full profile in one call

```bash
# Defaults: standard text keys + default chains + contenthash
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth"

# Narrow fields for UI cards
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth?texts=avatar,name,description,com.twitter&addresses=eth,base&contenthash=false"
```

Use `/profile` when you need multiple data types (texts + addresses + contenthash).

---

### Reverse resolve one address

```bash
curl "https://api.resolvio.xyz/ens/v2/reverse/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
```

Use `name` only when `hasReverseRecord` is `true`; otherwise show a shortened address fallback.

---

### Reverse resolve multiple addresses (leaderboards/tables)

```bash
curl "https://api.resolvio.xyz/ens/v2/reverse/bulk?addresses=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,0x225f137127d9067788314bc7fcc1f36746a3c3B5,0x179A862703a4adfb29896552DF9e307980D19285"
```

Batch size limit is 20. For larger sets, chunk requests into batches of 20.

---

### Fetch only text records

```bash
curl "https://api.resolvio.xyz/ens/v2/texts/vitalik.eth?keys=avatar,description,com.twitter,com.github,url"
```

Typical keys: `avatar`, `name`, `description`, `url`, `com.twitter`, `com.github`.

---

### Cache control and fresh reads

```bash
# Fresh read
curl "https://api.resolvio.xyz/ens/v2/profile/vitalik.eth?noCache=true"

# Clear cache for one name
curl -X DELETE "https://api.resolvio.xyz/ens/v2/cache/vitalik.eth?type=all"
```

Use cache bypass or cache clear when users just updated records and need immediate consistency.
