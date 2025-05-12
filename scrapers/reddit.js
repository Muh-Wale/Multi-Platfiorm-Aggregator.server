const axios = require('axios');
const prisma = require('../config/db');
const logger = require('../utils/logger');
const { transformRedditPost } = require('../utils/transformers');
const { filterRedditPosts } = require('../utils/filter');

async function scrapeReddit(queryId, searchText, minUpvotes = 10) {
    try {
        // 1. Fetch from Reddit API
        const response = await axios.get(
            `https://www.reddit.com/search.json?q=${encodeURIComponent(searchText)}&limit=20`,
            {
                timeout: 10000,
                headers: { 'User-Agent': 'AnswerAggregator/1.0' }
            }
        );

        // 2. Validate and filter
        if (!response.data?.data?.children) {
            throw new Error('Invalid Reddit API response');
        }
        const filteredPosts = filterRedditPosts(response.data.data.children, minUpvotes);

        // 3. Transform and save
        const dataToSave = filteredPosts.map(post =>
            transformRedditPost(post, queryId)
        );

        if (dataToSave.length > 0) {
            await prisma.rawResult.createMany({ data: dataToSave });
        }

        logger.info(`Saved ${dataToSave.length} Reddit posts for query ${queryId}`);
        return dataToSave.length;
    } catch (error) {
        logger.error(`Reddit scrape failed: ${error.message}`);
        throw error;
    }
}

module.exports = { scrapeReddit };