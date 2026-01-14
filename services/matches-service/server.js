const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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

// Root endpoint
app.get('/', (req, res) => {
  res.send('Matches Service is running');
});

// Matches routes
app.get('/api/v1/matches', (req, res) => {
  res.json({ success: true, message: 'Get matches', matches: [] });
});

app.post('/api/v1/matches', (req, res) => {
  res.json({ success: true, message: 'Match created' });
});

app.get('/api/v1/matches/:id', (req, res) => {
  res.json({ success: true, message: 'Get match', match: {} });
});

app.put('/api/v1/matches/:id', (req, res) => {
  res.json({ success: true, message: 'Match updated' });
});

app.delete('/api/v1/matches/:id', (req, res) => {
  res.json({ success: true, message: 'Match deleted' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

const PORT = Number(process.env.PORT) || 5009;
app.listen(PORT, () => {
  console.log(`Matches Service running on port ${PORT}`);
});
