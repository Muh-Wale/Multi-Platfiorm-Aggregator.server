// server/middlewares/validation.js
const { body, validationResult } = require('express-validator');

const registerRules = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { registerRules, validate };