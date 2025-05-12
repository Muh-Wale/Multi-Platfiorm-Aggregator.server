// workers/redditWorker.js
const { processJobs } = require('../services/queue.js');
const scrapeReddit = require('../scrapers/reddit.js');
const logger = require('../utils/logger');

module.exports = async () => {
    await processJobs('scraping', async (jobData) => {
        try {
            if (jobData.platform === 'reddit') {
                logger.info(`Processing Reddit job for query ${jobData.queryId}`);
                await scrapeReddit(jobData.queryId, jobData.text);
            }
        } catch (error) {
            logger.error(`Reddit worker failed: ${error.message}`);
            throw error; // Will trigger retry logic
        }
    });
};