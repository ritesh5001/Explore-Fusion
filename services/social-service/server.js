const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const followRoutes = require('./routes/followRoutes');

dotenv.config();

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'social',
    env: process.env.NODE_ENV,
  });
});

// Versioned routes
app.use('/api/v1', followRoutes);

// Backward-compat for direct service calls
app.use('/', followRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`Social Service running on port ${PORT}`));
