// tests/testStandardization.js
const prisma = require('../config/db');
const { getStandardizedResults } = require('../services/standardizeService');

async function testStandardization() {
    // 1. Get raw data from DB
    const rawResults = await prisma.rawResult.findMany({
        take: 5 // Limit to 5 records for testing
    });

    // 2. Standardize
    const standardized = getStandardizedResults(rawResults);

    // 3. Output
    console.log('=== Standardization Test ===');
    console.log('Raw DB Records Count:', rawResults.length);
    console.log('Standardized Samples:');
    console.log(standardized.slice(0, 2));

    // 4. Validation
    const isValid = standardized.every(item =>
        item.content &&
        item.platform &&
        item.metadata.url
    );
    console.log(`✅ Validation ${isValid ? 'Passed' : 'Failed'}`);
}

testStandardization().catch(console.error);