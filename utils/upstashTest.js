// utils/upstashTest.js
const { setKey, getKey } = require('./upstash.js');

async function test() {
    await setKey('test', 'Hello from Upstash!');
    const value = await getKey('test');
    console.log('✅ Retrieved value:', value);
}

test().catch(console.error);