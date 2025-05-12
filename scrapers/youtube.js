// server/scrapers/youtube.js
const axios = require('axios');
const prisma = require('../config/db');
const logger = require('../utils/logger');

async function scrapeYouTube(queryId, searchText) {
    try {
        const response = await axios.get(
            'https://www.googleapis.com/youtube/v3/search',
            {
                params: {
                    q: searchText,
                    key: process.env.YOUTUBE_API_KEY,
                    part: 'snippet',
                    type: 'video',
                    maxResults: 5
                }
            }
        );

        const createPromises = response.data.items.map(video => {
            return prisma.rawResult.create({
                data: {
                    queryId,
                    content: video.snippet.description || '[No description]',
                    platform: 'youtube',
                    metadata: {
                        title: video.snippet.title,
                        url: `https://youtu.be/${video.id.videoId}`,
                        channel: video.snippet.channelTitle,
                        publishedAt: video.snippet.publishedAt
                    }
                }
            });
        });

        await Promise.all(createPromises);
        logger.info(`Saved ${createPromises.length} YouTube videos for query ${queryId}`);
    } catch (error) {
        logger.error(`YouTube scrape failed: ${error.message}`);
        throw error;
    }
}

module.exports = { scrapeYouTube };