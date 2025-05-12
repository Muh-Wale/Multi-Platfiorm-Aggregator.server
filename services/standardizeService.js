// services/standardizeService.js
const { Prisma } = require('@prisma/client');

/**
 * Converts raw database records into standardized format
 * @param {Prisma.RawResult[]} rawResults 
 * @returns {import('../types/scrapedResult').ScrapedResult[]}
 */
function getStandardizedResults(rawResults) {
    return rawResults.map(result => {
        const base = {
            content: result.content,
            platform: result.platform,
            metadata: {
                url: result.metadata.url,
                author: result.metadata.author || 'unknown',
                score: result.metadata.score || 0,
                ...result.metadata // Spread remaining platform-specific fields
            }
        };

        // Platform-specific transformations
        switch (result.platform) {
            case 'reddit':
                base.metadata.upvotes = result.metadata.upvotes;
                break;
            case 'youtube':
                base.metadata.channel = result.metadata.channel;
                base.metadata.viewCount = result.metadata.viewCount;
                break;
            case 'stackoverflow':
                base.metadata.isAnswered = result.metadata.isAnswered;
                base.metadata.tags = result.metadata.tags;
                break;
        }

        return base;
    });
}

module.exports = { getStandardizedResults };