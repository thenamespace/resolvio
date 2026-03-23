const API_BASE_URL = process.env.RESOLVIO_URL || 'https://api.resolvio.xyz';

async function resolveProfiles(names: string[]) {
  let profiles: any[];

  if (names.length === 1) {
    const res = await fetch(`${API_BASE_URL}/ens/v2/profile/${names[0]}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    profiles = [await res.json()];
  } else {
    const params = new URLSearchParams({ names: names.join(',') });
    const res = await fetch(`${API_BASE_URL}/ens/v2/profile/bulk?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    profiles = await res.json();
  }

  profiles.forEach(printProfile);
}

function printProfile(profile: any) {
  console.log(`\nProfile: ${profile.name}`);
  console.log(`Resolver: ${profile.resolver ?? 'none'}`);

  const texts = profile.texts?.filter((t: any) => t.exists) ?? [];
  if (texts.length) {
    console.log('Texts:');
    texts.forEach((t: any) => console.log(`  ${t.key}: ${t.value}`));
  }

  const addrs = profile.addresses?.filter((a: any) => a.exists) ?? [];
  if (addrs.length) {
    console.log('Addresses:');
    addrs.forEach((a: any) => console.log(`  ${a.chain} (coin ${a.coin}): ${a.value}`));
  }

  if (profile.contenthash?.exists) {
    console.log(`Contenthash: ${profile.contenthash.value}`);
  }
}

const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['vitalik.eth'];

console.log(`Resolving: ${names.join(', ')}`);
resolveProfiles(names).catch(console.error);
