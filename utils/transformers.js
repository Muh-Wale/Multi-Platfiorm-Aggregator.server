function transformRedditPost(post, queryId) {
    return {
        queryId,
        content: post.data.selftext || post.data.title || '[No content]',
        platform: 'reddit',
        metadata: {
            upvotes: post.data.ups || 0,
            author: post.data.author || 'unknown',
            url: `https://reddit.com${post.data.permalink}`,
            title: post.data.title,
            score: post.data.ups || 0, // For standardized interface
            createdAt: post.data.created_utc
                ? new Date(post.data.created_utc * 1000)
                : new Date()
        }
    };
}

function transformStackOverflowPost(post, queryId) {
    return {
        queryId,
        content: post.body_markdown || post.title || '[No content]',
        platform: 'stackoverflow',
        metadata: {
            score: post.score || 0,
            url: post.link,
            isAnswered: post.is_answered || false,
            tags: post.tags || [],
            title: post.title,
            author: post.owner?.display_name || 'unknown' // Standardized field
        }
    };
}

module.exports = {
    transformRedditPost,
    transformStackOverflowPost
};