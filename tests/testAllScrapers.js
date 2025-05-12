const { scrapeReddit } = require('../scrapers/reddit');
const { scrapeYouTube } = require('../scrapers/youtube');
const { scrapeStackOverflow } = require('../scrapers/stackoverflow');
const prisma = require('../config/db');

// Test cases for each platform
const TEST_CASES = [
    { platform: 'reddit', scraper: scrapeReddit, query: 'JavaScript frameworks' },
    { platform: 'youtube', scraper: scrapeYouTube, query: 'React tutorial' },
    { platform: 'stackoverflow', scraper: scrapeStackOverflow, query: 'java' }
];

async function testScraper({ platform, scraper, query }) {
    console.log(`\n=== Testing ${platform} scraper ===`);

    // 1. Create test query
    const testQuery = await prisma.query.create({
        data: { text: query, platforms: [platform] }
    });

    // 2. Run scraper
    await scraper(testQuery.id, testQuery.text);

    // 3. Verify results
    const results = await prisma.rawResult.findMany({
        where: { queryId: testQuery.id }
    });

    console.log(`✅ Found ${results.length} ${platform} results`);
    console.log(results.map(r => ({
        content: r.content.substring(0, 60) + '...',
        url: r.metadata.url
    })));

    // 4. Cleanup
    await prisma.rawResult.deleteMany({ where: { queryId: testQuery.id } });
    await prisma.query.delete({ where: { id: testQuery.id } });
}

// Run all tests
async function runTests() {
    for (const testCase of TEST_CASES) {
        await testScraper(testCase).catch(console.error);
    }
}

runTests();