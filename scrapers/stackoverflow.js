// scrapers/stackoverflow.js
const axios = require('axios');
const prisma = require('../config/db');
const logger = require('../utils/logger');

async function scrapeStackOverflow(queryId, searchText) {
    try {
        // 1. Prepare search parameters
        const params = {
            site: 'stackoverflow',
            pagesize: 10,
            filter: '!nNPvSNdWme',
            sort: 'votes',
            q: encodeURIComponent(searchText),
            tagged: 'javascript;reactjs', // Required parameter
            accepted: 'True' // Only get accepted answers
        };

        // 2. Make API request
        const response = await axios.get(
            'https://api.stackexchange.com/2.3/search',
            { params, timeout: 10000 }
        );

        // 3. Process results
        if (!response.data?.items) {
            throw new Error('No items in API response');
        }

        const savePromises = response.data.items.map(post =>
            prisma.rawResult.create({
                data: {
                    queryId,
                    content: post.body_markdown || post.title,
                    platform: 'stackoverflow',
                    metadata: {
                        score: post.score,
                        url: `https://stackoverflow.com/q/${post.question_id}`,
                        isAnswered: post.is_answered,
                        accepted: !!post.accepted_answer_id
                    }
                }
            })
        );

        await Promise.all(savePromises);
        logger.info(`Saved ${savePromises.length} StackOverflow posts`);
        return savePromises.length;

    } catch (error) {
        logger.error(`StackOverflow scrape failed: ${error.message}`);
        throw error;
    }
}

module.exports = { scrapeStackOverflow };