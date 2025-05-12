// server/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const queryRoutes = require('./routes/queryRoutes');
require('dotenv').config();

const app = express();

module.exports = app;

app.use(cors({
    origin: "*", // Allow all origins temporarily for testing
    credentials: true,
}));

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send('Hello Leave Here');
});
app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
    });
});
