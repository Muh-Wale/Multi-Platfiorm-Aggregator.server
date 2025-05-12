// utils/scoreFilter.js
const filtered = rawResults.filter(post =>
    post.metadata.upvotes > 10 && !post.content.includes('spam')
);