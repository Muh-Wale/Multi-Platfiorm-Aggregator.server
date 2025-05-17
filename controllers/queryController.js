// controllers/queryController.js
const prisma = require('../config/db');
const { scrapeReddit } = require('../scrapers/reddit');
const { scrapeYouTube } = require('../scrapers/youtube');
const { scrapeStackOverflow } = require('../scrapers/stackoverflow');
const { summarize } = require('../services/summarizer');

async function submitQuery(text, platforms, userId) {
    // 1. Save query to DB
    const query = await prisma.query.create({
        data: { text, platforms, userId }
    });

    // 2. Trigger scrapers
    platforms.forEach(platform => {
        switch (platform) {
            case 'reddit': scrapeReddit(query.id, text); break;
            case 'youtube': scrapeYouTube(query.id, text); break;
            case 'stackoverflow': scrapeStackOverflow(query.id, text); break;
        }
    });

    return query;
}

async function getRawResults(queryId) {
    const rawResults = await prisma.rawResult.findMany({
        where: { queryId },
        orderBy: { createdAt: 'desc' }
    });
    return rawResults;
}

async function getSummary(queryId) {
    return await summarize(queryId);
}

module.exports = { submitQuery, getSummary, getRawResults };