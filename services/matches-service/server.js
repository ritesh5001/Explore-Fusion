const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

const buddyRoutes = require('./routes/buddyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'matches',
    env: process.env.NODE_ENV,
  });
});

// Versioned health
app.get('/api/v1/matches/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'matches',
    env: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Matches Service is running');
});

// Buddy matcher APIs (used by frontend as /matches/*)
app.use('/api/v1/matches', buddyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

const PORT = Number(process.env.MATCHES_PORT) || Number(process.env.PORT) || 5009;

const mongoUri =
  process.env.MATCHES_MONGO_URI ||
  process.env.MONGO_URI ||
  (!isProd ? 'mongodb://localhost:27017/ef_matches_db' : null);
if (!mongoUri) {
  console.error('Matches service misconfigured: MONGO_URI is required in production');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ Matches DB Connected');
    app.listen(PORT, () => {
      console.log(`Matches Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Matches DB Error:', err);
    process.exit(1);
  });
