const express = require('express');

const makeNotificationsRouter = () => {
  const router = express.Router();

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
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification', env: process.env.NODE_ENV });
  });

  router.use(requireAuthHeader);

  router.get('/', (req, res) => {
    res.json({ success: true, message: 'Get notifications', notifications: [] });
  });

  router.post('/', (req, res) => {
    res.json({ success: true, message: 'Notification created' });
  });

  router.get('/my', (req, res) => {
    res.json({ success: true, message: 'My notifications', notifications: [] });
  });

  router.get('/:id', (req, res) => {
    res.json({ success: true, message: 'Get notification', notification: {} });
  });

  router.put('/:id', (req, res) => {
    res.json({ success: true, message: 'Notification updated' });
  });

  router.delete('/:id', (req, res) => {
    res.json({ success: true, message: 'Notification deleted' });
  });

  return router;
};

const initNotifications = async () => makeNotificationsRouter();

module.exports = { initNotifications };
