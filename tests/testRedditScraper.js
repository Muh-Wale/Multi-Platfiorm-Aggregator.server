// tests/testRedditScraper.js
const { scrapeReddit } = require('../scrapers/reddit');
const prisma = require('../config/db');

async function test() {
    // 1. Create parent Query first
    const testQuery = await prisma.query.create({
        data: {
            text: 'web development',
            platforms: ['reddit']
        }
    });

    console.log('\n=== Starting Test ===');
    await scrapeReddit(testQuery.id, testQuery.text);

    // 2. Verify results
    const results = await prisma.rawResult.findMany({
        where: { queryId: testQuery.id }
    });

    console.log(`✅ Found ${results.length} posts`);

    // 3. Cleanup
    await prisma.rawResult.deleteMany({ where: { queryId: testQuery.id } });
    await prisma.query.delete({ where: { id: testQuery.id } });
}

test().catch(e => {
    console.error('❌ Test failed:', e);
    process.exit(1);
});