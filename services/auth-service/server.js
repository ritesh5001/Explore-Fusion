const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const adminRoutes = require('./routes/adminRoutes');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const imagekitRoutes = require('./routes/imagekitRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth',
    env: process.env.NODE_ENV,
  });
});

app.get('/', (req, res) => {
    res.send('Auth Service is running');
});
// Support both direct service calls (/login) and versioned calls (/api/v1/auth/login).
app.use('/api/v1/auth', authRoutes);
app.use('/', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', imagekitRoutes);
app.use('/', imagekitRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Not found',
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});