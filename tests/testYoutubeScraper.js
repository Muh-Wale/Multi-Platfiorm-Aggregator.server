// tests/testYoutubeScraper.js
const { scrapeStackOverflow } = require('../scrapers/stackoverflow');
const prisma = require('../config/db');

async function test() {
    const testQuery = await prisma.query.create({
        data: { text: 'React tutorial', platforms: ['stackoverflow'] }
    });

    await scrapeStackOverflow(testQuery.id, testQuery.text);
    const results = await prisma.rawResult.findMany({
        where: { queryId: testQuery.id }
    });
    console.log(results);
}

test();