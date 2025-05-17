const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const queryRoutes = require('./routes/queryRoutes');
const prisma = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // or your frontend domain
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello Leave Here');
});

app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);

// Only export after all configuration is done
module.exports = app;

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received, shutting down gracefully');
        if (prisma) await prisma.$disconnect();
        server.close(() => {
            console.log('Process terminated');
        });
    });
}