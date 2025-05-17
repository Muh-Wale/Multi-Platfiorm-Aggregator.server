const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const queryRoutes = require('./routes/queryRoutes');
const prisma = require('./config/db');
require('dotenv').config();

const app = express();

// Updated CORS configuration to handle both development and production environments
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        const allowedOrigins = [
            'http://localhost:5173',
            'https://your-frontend-domain.com', // Replace with your deployed frontend domain
            // Add any other frontend origins you need
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("Origin not allowed by CORS:", origin);
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Set explicit headers for CORS preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.header('origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

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