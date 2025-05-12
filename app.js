require('dotenv').config();
// server/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const queryRoutes = require('./routes/queryRoutes');

const app = express();

app.use(cors({
    origin: "*", // Allow all origins temporarily for testing
    credentials: true,
}));

// const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello Leave Here');
});

app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);

// const server = app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

module.exports = app;