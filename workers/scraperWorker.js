// server/workers/scraperWorker.js
const { scrapeReddit } = require('../scrapers/reddit');
const { scrapeYouTube } = require('../scrapers/youtube');
const { scrapeStackOverflow } = require('../scrapers/stackoverflow');
const logger = require('../utils/logger');

const PLATFORM_SCRAPERS = {
    reddit: scrapeReddit,
    youtube: scrapeYouTube,
    stackoverflow: scrapeStackOverflow
};

async function processJob(jobData) {
    const scraper = PLATFORM_SCRAPERS[jobData.platform];
    if (!scraper) throw new Error(`Unsupported platform: ${jobData.platform}`);

    await scraper(jobData.queryId, jobData.text);
}

module.exports = { processJob };