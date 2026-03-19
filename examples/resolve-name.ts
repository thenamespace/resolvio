const API_BASE_URL = process.env.RESOLVIO_URL || 'https://api.resolvio.xyz';

async function resolveProfile(name: string) {
  const res = await fetch(`${API_BASE_URL}/ens/v2/profile/${name}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const profile = await res.json();

  console.log(`\nProfile for ${name}`);
  console.log(`Resolver: ${profile.resolver ?? 'none'}`);

  const set = profile.texts?.filter((t: any) => t.exists) ?? [];
  if (set.length) {
    console.log('\nTexts:');
    set.forEach((t: any) => console.log(`  ${t.key}: ${t.value}`));
  }

  const addrs = profile.addresses?.filter((a: any) => a.exists) ?? [];
  if (addrs.length) {
    console.log('\nAddresses:');
    addrs.forEach((a: any) => console.log(`  ${a.chain} (coin ${a.coin}): ${a.value}`));
  }

  if (profile.contenthash?.exists) {
    console.log(`\nContenthash: ${profile.contenthash.value}`);
  }

  return profile;
}

const name = process.argv[2] || 'vitalik.eth';
console.log(`Resolving ${name}...`);
resolveProfile(name).catch(console.error);
