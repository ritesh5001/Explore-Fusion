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

// Versioned health
app.get('/api/v1/notifications/health', (req, res) => {
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

const notificationsRouter = express.Router();

// Notifications routes
notificationsRouter.get('/', (req, res) => {
  res.json({ success: true, message: 'Get notifications', notifications: [] });
});

notificationsRouter.post('/', (req, res) => {
  res.json({ success: true, message: 'Notification created' });
});

notificationsRouter.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get notification', notification: {} });
});

notificationsRouter.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Notification updated' });
});

notificationsRouter.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});

app.use('/api/v1/notifications', notificationsRouter);

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
