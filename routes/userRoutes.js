const express = require('express');
const { register, login, refresh } = require('../controllers/userController');
const { registerRules, validate } = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const prisma = require('../config/db');
const router = express.Router();

// Auth routes
router.post('/register', registerRules, validate, register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.get('/profile', authenticate(), (req, res) => {
    res.json(req.user);
});

router.get('/history', authenticate(), async (req, res) => {
    const history = await prisma.query.findMany({
        where: { userId: req.user.id },
        include: { summaries: true }
    });
    res.json(history);
});


router.post('/saved', authenticate(), async (req, res) => {
    await prisma.savedSummary.create({
        data: {
            userId: req.user.id,
            summaryId: req.body.summaryId
        }
    });
    res.status(201).send();
});

// Admin-only route
router.delete('/users/:id', authenticate('admin'), async (req, res) => {
    // Implement admin user deletion logic
    res.sendStatus(204);
});

// Debug route (kept from original)
router.get('/debug', (req, res) => {
    res.json({
        jwtSecret: !!process.env.JWT_SECRET,
        refreshSecret: !!process.env.REFRESH_SECRET
    });
});

module.exports = router;