// routes/queryRoutes.js
const express = require('express');
const { submitQuery, getSummary, getRawResults } = require('../controllers/queryController');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require('../middlewares/auth');
const prisma = require('../config/db');

const queryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Only 5 queries per 15 minutes
    message: 'Too many query submissions - try again later'
});

// POST /api/queries - Submit new query
// routes/queryRoutes.js
router.post('/', authenticate(), queryLimiter, async (req, res) => {
    try {
        const { text, platforms } = req.body;
        const query = await submitQuery(text, platforms, req.user.id); // Pass user ID
        res.status(201).json(query);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/queries/:id/summary - Get summary
// In getSummary route:
router.get('/:id/summary', authenticate(), async (req, res) => {
    try {
        // First verify the query exists and belongs to the user
        const query = await prisma.query.findUnique({
            where: { id: req.params.id }
        });

        if (!query) {
            return res.status(404).json({ error: "Query not found" });
        }

        if (query.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to access this query" });
        }

        // Then get the summary
        const summary = await getSummary(req.params.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/raw', authenticate(), async (req, res) => {
    try {
        const query = await prisma.query.findUnique({
            where: { id: req.params.id }
        });

        if (!query) {
            return res.status(404).json({ error: "Query not found" });
        }

        if (query.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to access this query" });
        }

        const rawResults = await getRawResults(req.params.id);
        res.json(rawResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;