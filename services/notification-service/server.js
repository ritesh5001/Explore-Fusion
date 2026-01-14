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
    service: 'notification',
    env: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Notification Service is running');
});

// Notifications routes
app.get('/api/v1/notifications', (req, res) => {
  res.json({ success: true, message: 'Get notifications', notifications: [] });
});

app.post('/api/v1/notifications', (req, res) => {
  res.json({ success: true, message: 'Notification created' });
});

app.get('/api/v1/notifications/:id', (req, res) => {
  res.json({ success: true, message: 'Get notification', notification: {} });
});

app.put('/api/v1/notifications/:id', (req, res) => {
  res.json({ success: true, message: 'Notification updated' });
});

app.delete('/api/v1/notifications/:id', (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

const PORT = Number(process.env.PORT) || 5008;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
