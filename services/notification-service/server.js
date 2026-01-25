const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

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

const requireAuthHeader = (req, res, next) => {
  const header = String(req.headers.authorization || '');
  if (!header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  return next();
};

// Notifications routes
notificationsRouter.get('/', (req, res) => {
  res.json({ success: true, message: 'Get notifications', notifications: [] });
});

notificationsRouter.post('/', (req, res) => {
  res.json({ success: true, message: 'Notification created' });
});

notificationsRouter.get('/my', requireAuthHeader, (req, res) => {
  res.json({ success: true, message: 'My notifications', notifications: [] });
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

const PORT = Number(process.env.NOTIFICATION_PORT) || Number(process.env.PORT) || 5008;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
