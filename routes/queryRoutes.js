const express = require('express');
const { submitQuery, getSummary, getRawResults } = require('../controllers/queryController');
const rateLimit = require('express-rate-limit');
const authenticate = require('../middlewares/auth');
const prisma = require('../config/db');

const router = express.Router();

const queryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes times
    max: 10, // Only 5 queries per 15 minutes
    message: 'Too many query submissions - try again later'
});

// POST /api/queries - Submit new query
router.post('/', authenticate(), queryLimiter, async (req, res) => {
    try {
        const { text, platforms } = req.body;
        const query = await submitQuery(text, platforms, req.user.id);
        res.status(201).json(query);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function verifyUserQuery(queryId, userId) {
    const query = await prisma.query.findUnique({ where: { id: queryId } });
    if (!query) throw { status: 404, message: 'Query not found' };
    if (query.userId !== userId) throw { status: 403, message: 'Not authorized' };
    return query;
}

// GET /api/queries/:id/summary
router.get('/:id/summary', authenticate(), async (req, res) => {
    try {
        await verifyUserQuery(req.params.id, req.user.id);
        const summary = await getSummary(req.params.id);
        res.json(summary);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Server error' });
    }
});

// GET /api/queries/:id/raw
router.get('/:id/raw', authenticate(), async (req, res) => {
    try {
        await verifyUserQuery(req.params.id, req.user.id);
        const rawResults = await getRawResults(req.params.id);
        res.json(rawResults);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'Server error' });
    }
});

module.exports = router;
