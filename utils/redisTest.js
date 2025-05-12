// utils/redisTest.js - FULL WORKING VERSION
const { createClient } = require('redis');

// REPLACE THIS WITH YOUR ACTUAL RAILWAY URL
const REDIS_URL = 'redis://default:srFoIYfEVmdkWHigofoEHgtPssIHZKFp@redis.railway.internal:6379';

const client = createClient({
    url: REDIS_URL,
    socket: {
        tls: true, // Railway requires TLS
        rejectUnauthorized: false // Bypass certificate validation (dev only)
    }
});

async function test() {
    try {
        await client.connect();
        console.log('🚀 Successfully connected to Railway Redis!');
        await client.set('test', 'Hello from Railway');
        console.log('📦 Stored value:', await client.get('test'));
    } catch (err) {
        console.error('💥 Connection failed:', err);
    } finally {
        await client.quit();
    }
}

test();