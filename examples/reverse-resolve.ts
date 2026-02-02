/**
 * Example: Reverse Resolution (Address to Name)
 * 
 * This example demonstrates how to use Resolvio
 * to perform reverse resolution - converting Ethereum addresses to ENS names.
 */

// Use production or local API
const API_BASE_URL = process.env.RESOLVIO_URL || 'https://resolvio.namespace.ninja';

async function reverseResolve(addresses: string[]) {
    try {
        const response = await fetch(`${API_BASE_URL}/ens/v1/reverse/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addresses }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log(`\n🔄 Reverse Resolution Results:`);
        console.log(`  Total addresses: ${result.result.length}\n`);

        result.result.forEach((item: any) => {
            if (item.hasReverseRecord && item.name) {
                console.log(`✅ ${item.address}`);
                console.log(`   → ${item.name}\n`);
            } else {
                console.log(`❌ ${item.address}`);
                console.log(`   → No reverse record found\n`);
            }
        });

        return result;
    } catch (error) {
        console.error(`❌ Error during reverse resolution:`, error);
        throw error;
    }
}

// Example addresses
const exampleAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    '0x225f137127d9067788314bc7fcc1f36746a3c3B5', // luc.eth
    '0x0000000000000000000000000000000000000000', // null address (no record)
];

const addressesToResolve = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : exampleAddresses;

console.log(`\n🔍 Performing reverse resolution for ${addressesToResolve.length} address(es)...`);
reverseResolve(addressesToResolve);
