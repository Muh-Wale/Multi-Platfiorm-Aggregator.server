require('dotenv').config();
// server/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// In userController.js
const generateTokens = (userId) => {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
        throw new Error("JWT secrets are not configured");
    }

    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        res.status(201).json({ id: user.id, email });
    } catch (error) {
        res.status(400).json({ error: "User already exists" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000 })
        .cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 604800000 })
        .json({ accessToken });
};

const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) return res.sendStatus(403);
        const { accessToken } = generateTokens(user.id);
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 900000 })
            .json({ accessToken });
    });
};

module.exports = { register, login, refresh };