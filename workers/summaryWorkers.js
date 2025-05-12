// server/workers/summaryWorker.js
const { Worker } = require('bullmq');
const { generateSummary } = require('../services/summaryService');

new Worker('scraping', async job => {
    if (job.name === 'reddit') {
        // Scraping done, now summarize
        await generateSummary(job.data.queryId);
    }
});