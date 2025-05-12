const _ = require('lodash');
const prisma = require('../config/db');
const logger = require('../utils/logger');

/**
 * Rule-based summarization algorithm
 * @param {string} queryId 
 * @returns {Promise<{ summary: string, sources: string[] }> }
 */
async function summarize(queryId) {
    logger.info(`Summarizing results for queryId: ${queryId}`);

    const rawResults = await prisma.rawResult.findMany({
        where: { queryId }
    });

    if (rawResults.length === 0) {
        throw new Error('No results found for this query');
    }

    logger.info(`Found ${rawResults.length} raw results`);

    const scoredResults = rawResults.map(result => {
        const meta = result.metadata || {};
        let score = 0;

        switch (result.platform.toLowerCase()) {
            case 'reddit':
                score = (meta.upvotes || 0) * 1.5 + (meta.numComments || 0);
                break;
            case 'youtube':
                score = (parseInt(meta.viewCount) || 0) * 0.5 + (parseInt(meta.likeCount) || 0) * 2;
                break;
            case 'stackoverflow':
                score = (meta.score || 0) * (meta.isAnswered ? 2 : 1);
                break;
            case 'twitter':
            case 'x':
                score = (meta.likes || 0) + (meta.retweets || 0);
                break;
            case 'tiktok':
                score = (meta.views || 0) + (meta.likes || 0);
                break;
            case 'facebook':
                score = (meta.reactions || 0) + (meta.shares || 0);
                break;
            default:
                score = 1; // Fallback
        }

        return {
            ...result,
            score,
            cleanContent: cleanText(result.content)
        };
    });

    // Deduplicate based on cleaned content (first 150 chars)
    const uniqueResults = _.uniqBy(scoredResults, r => r.cleanContent.substring(0, 150));

    // Pick top 3 by score
    const topResults = _.orderBy(uniqueResults, 'score', 'desc').slice(0, 10);

    if (topResults.length === 0) {
        return {
            summary: "No meaningful results to summarize.",
            sources: []
        };
    }

    // Format results
    const platformIcons = {
        reddit: '🔴',
        youtube: '📺',
        stackoverflow: '📘',
        twitter: '🐦',
        x: '🐦',
        facebook: '📘',
        tiktok: '🎵',
        instagram: '📸',
        pinterest: '📌'
    };

    const summary = topResults.map((res, i) => {
        const icon = platformIcons[res.platform.toLowerCase()] || '🌐';
        return `${i + 1}. [${icon} ${res.platform.toUpperCase()}] ${res.cleanContent.slice(0, 200)}...`;
    }).join('\n\n');

    const sources = topResults.map(r => r.metadata?.url).filter(Boolean);

    logger.info(`Generated summary with ${topResults.length} entries`);

    return { summary, sources };
}

function cleanText(text) {
    return (text || '')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/https?:\/\/\S+/g, '') // Remove raw URLs in text
        .replace(/[#*@]/g, '')          // Clean common platform noise
        .trim();
}

module.exports = { summarize };
