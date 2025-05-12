// tests/testsum.js
const { summarize } = require('../services/summarizer');
const prisma = require('../config/db');

async function test() {
    const testQuery = await prisma.query.findFirst({
        where: {
            rawResults: {
                some: {} // Ensure it has at least one rawResult
            }
        },
        include: { rawResults: true }
    });


    if (!testQuery || testQuery.rawResults.length === 0) {
        console.log('❌ No queries with raw results found. Run scrapers first!');
        return;
    }


    console.log(`Testing query: "${testQuery.text}"`);
    console.log(`Found ${testQuery.rawResults.length} raw results`);

    // Debug: Show raw data
    console.log('\n=== RAW RESULTS ===');
    console.log(testQuery.rawResults.map(r => ({
        id: r.id,
        platform: r.platform,
        content: r.content.substring(0, 50) + '...',
        metadata: r.metadata
    })));

    const { summary, sources } = await summarize(testQuery.id);

    console.log('\n=== SUMMARY ===');
    console.log(summary || '[Empty summary]');
    console.log('\n=== SOURCES ===');
    console.log(sources?.join('\n') || '[No sources]');
}

test().catch(console.error);