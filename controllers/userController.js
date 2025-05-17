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
    const isProduction = process.env.NODE_ENV === 'production';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    // ✅ Set cookies
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 15 * 60 * 1000
    });

    // ✅ Send final response
    res.status(200).json({ accessToken });
};

const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.refreshToken !== token) {
            return res.sendStatus(403);
        }

        const { accessToken } = generateTokens(user.id);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 15 * 60 * 1000
        });

        res.json({ accessToken });

    } catch (err) {
        console.error('Invalid refresh token:', err);
        return res.sendStatus(403);
    }
};


module.exports = { register, login, refresh };