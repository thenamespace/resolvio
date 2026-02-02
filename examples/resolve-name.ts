/**
 * Example: Resolve ENS Name to Address
 * 
 * This example demonstrates how to use Resolvio
 * to resolve an ENS name to an Ethereum address.
 */

// Use production or local API
const API_BASE_URL = process.env.RESOLVIO_URL || 'https://resolvio.namespace.ninja';

async function resolveEnsName(name: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/ens/v1/profile/${name}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const profile = await response.json();

        console.log(`\n📝 Profile for ${name}:`);
        console.log(`  Name: ${profile.name}`);
        console.log(`  Resolver: ${profile.resolver}`);

        // Display addresses
        if (profile.addresses && profile.addresses.length > 0) {
            console.log(`\n💳 Addresses:`);
            profile.addresses.forEach((addr: any) => {
                console.log(`  ${addr.name.toUpperCase()}: ${addr.address}`);
            });
        }

        // Display text records
        if (profile.texts && profile.texts.length > 0) {
            console.log(`\n📄 Text Records:`);
            profile.texts.forEach((text: any) => {
                if (text.value) {
                    console.log(`  ${text.key}: ${text.value}`);
                }
            });
        }

        // Display contenthash
        if (profile.contenthash) {
            console.log(`\n🔗 Contenthash: ${profile.contenthash}`);
        }

        return profile;
    } catch (error) {
        console.error(`❌ Error resolving ${name}:`, error);
        throw error;
    }
}

// Run example
const nameToResolve = process.argv[2] || 'vitalik.eth';
console.log(`\n🔍 Resolving: ${nameToResolve}...`);
resolveEnsName(nameToResolve);
