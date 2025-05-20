// utils/upstash.js
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

async function setKey(key, value) {
    const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/set/${key}/${value}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            }
        }
    );
    return await response.json();
}

async function getKey(key) {
    const response = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            }
        }
    );
    const data = await response.json();
    return data.result; // Returns the value directly
}

module.exports = { setKey, getKey };