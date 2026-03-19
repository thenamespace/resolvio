const API_BASE_URL = process.env.RESOLVIO_URL || 'https://api.resolvio.xyz';

async function reverseResolve(addresses: string[]) {
  if (addresses.length === 1) {
    const res = await fetch(`${API_BASE_URL}/ens/v2/reverse/${addresses[0]}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    printResult(result);
    return;
  }

  const params = new URLSearchParams({ addresses: addresses.join(',') });
  const res = await fetch(`${API_BASE_URL}/ens/v2/reverse/bulk?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { addresses: results } = await res.json();
  results.forEach(printResult);
}

function printResult(item: { address: string; hasReverseRecord: boolean; name?: string }) {
  if (item.hasReverseRecord) {
    console.log(`${item.address}  ->  ${item.name}`);
  } else {
    console.log(`${item.address}  ->  (no reverse record)`);
  }
}

const addresses = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
      '0x225f137127d9067788314bc7fcc1f36746a3c3B5', // luc.eth
      '0x0000000000000000000000000000000000000000', // no record
    ];

reverseResolve(addresses).catch(console.error);
