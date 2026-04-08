const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const securityMiddleware = require('./middleware/security');
const connectDB = require('./config/db');
const authRoutes = require('./auth/routes/authRoutes');
const userRoutes = require('./auth/routes/userRoutes');
const imagekitRoutes = require('./auth/routes/imagekitRoutes');
const { getImagekitAuth } = require('./auth/controllers/imagekitController');
const aiRoutes = require('./ai/routes/aiRoutes');
const adminRoutes = require('./admin/routes/adminRoutes');
const bookingRoutes = require('./booking/routes/bookingRoutes');
const packageRoutes = require('./booking/routes/packages');
const itineraryRoutes = require('./booking/routes/itineraryRoutes');
const reviewRoutes = require('./booking/routes/reviewRoutes');
const matchesRoutes = require('./matches/routes/buddyRoutes');
const notificationsRoutes = require('./notifications');
const postsRoutes = require('./post/routes/postRoutes');
const socialRoutes = require('./social/routes/followRoutes');
const createUploadRoutes = require('./upload/routes/uploadRoutes');
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
  await connectDB();

  const uploadsDir = path.join(__dirname, 'upload', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const uploadRoutes = createUploadRoutes(uploadsDir);

  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/packages', packageRoutes);
  app.use('/api/v1/itineraries', itineraryRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/matches', matchesRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/posts', postsRoutes);
  app.use('/posts', postsRoutes);
  app.use('/api/v1', socialRoutes);
  app.use('/', socialRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/uploads', express.static(uploadsDir));

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