// utils/filters.js

function filterRedditPosts(posts, minUpvotes = 10) {
    return posts.filter(post =>
        post.data.ups >= minUpvotes &&
        !post.data.stickied // Exclude stickied moderator posts
    );
}

function filterStackOverflowPosts(posts, onlyAccepted = true) {
    return posts.filter(post =>
        onlyAccepted ? post.is_accepted || post.is_answered : true
    );
}

function filterYouTubeVideos(videos, minViews = 1000) {
    return videos.filter(video => video.metadata.viewCount >= minViews);
}

module.exports = {
    filterRedditPosts,
    filterYouTubeVideos,
    filterStackOverflowPosts
};