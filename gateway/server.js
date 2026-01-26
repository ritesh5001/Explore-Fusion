const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const securityMiddleware = require('./middleware/security');
const connectAuthDb = require('./auth/config/db');
const authRoutes = require('./auth/routes/authRoutes');
const userRoutes = require('./auth/routes/userRoutes');
const imagekitRoutes = require('./auth/routes/imagekitRoutes');
const { getImagekitAuth } = require('./auth/controllers/imagekitController');
const aiRoutes = require('./ai/routes/aiRoutes');
const { initBooking } = require('./booking');
const { initAdmin } = require('./admin');
const { initMatches } = require('./matches');
const { initNotifications } = require('./notifications');
const { initPosts } = require('./post');
const { initSocial } = require('./social');
const { initUpload } = require('./upload');
const { initChat } = require('./chat');

const app = express();
const server = http.createServer(app);
initChat(server);

app.use(securityMiddleware());

const getFetch = () => {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch;
  return async (...args) => {
    const mod = await import('node-fetch');
    return mod.default(...args);
  };
};

const defaultCorsOrigins = ['http://localhost:5173', 'https://explore-fusion.vercel.app'];
const corsOrigins = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : defaultCorsOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    ok: true,
    env: process.env.NODE_ENV,
  });
});

app.get('/matches/health', (req, res) => {
  res.json({ status: 'ok', service: 'matches', env: process.env.NODE_ENV });
});

app.get('/notifications/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification', env: process.env.NODE_ENV });
});

app.get('/posts/health', (req, res) => {
  res.json({ status: 'ok', service: 'post', env: process.env.NODE_ENV });
});

app.get('/social/health', (req, res) => {
  res.json({ status: 'ok', service: 'social', env: process.env.NODE_ENV });
});

app.get('/upload/health', (req, res) => {
  res.json({ status: 'ok', service: 'upload', env: process.env.NODE_ENV });
});

app.get('/imagekit-auth', getImagekitAuth);
app.get('/api/v1/imagekit-auth', getImagekitAuth);

app.get('/', (req, res) => {
  res.send('Explore Fusion Gateway is running');
});

app.use('/api/v1/auth', authRoutes);
app.use('/', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', imagekitRoutes);
app.use('/', imagekitRoutes);
app.use('/api/v1/ai', aiRoutes);

const startGateway = async () => {
  await connectAuthDb();
  const adminRouter = await initAdmin();
  app.use('/api/v1/admin', adminRouter);

  const bookingModule = await initBooking();
  app.use('/api/v1/packages', bookingModule.packageRouter);
  app.use('/api/v1/itineraries', bookingModule.itineraryRouter);
  app.use('/api/v1/bookings', bookingModule.bookingRouter);
  app.use('/api/v1/reviews', bookingModule.reviewRouter);

  const matchesRouter = await initMatches();
  app.use('/api/v1/matches', matchesRouter);

  const notificationsRouter = await initNotifications();
  app.use('/api/v1/notifications', notificationsRouter);

  const postsRouter = await initPosts();
  app.use('/api/v1/posts', postsRouter);
  app.use('/posts', postsRouter);

  const socialRouter = await initSocial();
  app.use('/api/v1', socialRouter);
  app.use('/', socialRouter);

  const uploadModule = await initUpload();
  app.use('/api/v1/upload', uploadModule.router);
  app.use('/uploads', express.static(uploadModule.uploadsDir));

  const PORT = Number(process.env.PORT) || 5050;
  server.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);

    if (process.env.NODE_ENV === 'production') {
      const keepAliveUrls = [
        'https://explore-fusion-gateway.onrender.com/health',
        'https://explore-fusion-auth.onrender.com/health',
      ];

      const uniqueKeepAliveUrls = [...new Set(keepAliveUrls)];
      const fetchFn = getFetch();

      const ping = async () => {
        for (const url of uniqueKeepAliveUrls) {
          try {
            await fetchFn(url, { method: 'GET' });
          } catch (_) {
            // Ignore errors; the goal is only to wake services.
          }
        }
      };

      const interval = setInterval(ping, 5 * 60 * 1000);
      interval.unref?.();
      ping();
    }
  });
};

server.on('error', (err) => {
  console.error('Gateway server error:', err);
});

startGateway().catch((err) => {
  console.error('Gateway failed to start:', err);
  process.exit(1);
});