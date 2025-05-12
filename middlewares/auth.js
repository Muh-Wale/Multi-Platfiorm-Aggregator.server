// server/middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (requiredRole = 'user') => {
    return (req, res, next) => {
        // Get token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(401).json({ error: "Access denied" });

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            // Role-based access control
            if (requiredRole !== 'user' && verified.role !== requiredRole) {
                return res.status(403).json({ error: "Insufficient permissions" });
            }

            next();
        } catch (error) {
            res.status(401).json({ error: "Invalid token" });
        }
    };
};

module.exports = authenticate;