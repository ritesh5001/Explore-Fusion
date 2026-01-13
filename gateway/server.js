const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const securityMiddleware = require('./middleware/security');

dotenv.config();

const app = express();

app.use(securityMiddleware());

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

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    env: process.env.NODE_ENV,
  });
});

app.get('/', (req, res) => {
  res.send('Explore Fusion Gateway is running');
});

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:5007';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://localhost:5002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5003';
const MATCHES_SERVICE_URL = process.env.MATCHES_SERVICE_URL || BOOKING_SERVICE_URL;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || BOOKING_SERVICE_URL;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5004';
const UPLOAD_SERVICE_URL = process.env.UPLOAD_SERVICE_URL || 'http://localhost:5005';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:5006';

app.use(
  '/api/v1/admin',
  createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/admin${path}`,
  })
);
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '',
    },
  })
);

app.use(
  '/api/v1/imagekit-auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/imagekit-auth${path}`,
  })
);

app.use(
  '/api/v1/users',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);
app.use(
  '/api/v1/posts',
  createProxyMiddleware({
    target: POST_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/posts': '',
    },
  })
);

app.use(
  '/api/v1/ai',
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ai': '',
    },
  })
);

app.use(
  '/api/v1/itineraries',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/itineraries${path}`,
  })
);

app.use(
  '/api/v1/packages',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/packages${path}`,
  })
);

app.use(
  '/api/v1/bookings',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/bookings${path}`,
  })
);

app.use(
  '/api/v1/reviews',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/reviews${path}`,
  })
);

app.use(
  '/api/v1/matches',
  createProxyMiddleware({
    target: MATCHES_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/matches${path}`,
  })
);

app.use(
  '/api/v1/notifications',
  createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/notifications${path}`,
  })
);

app.use(
  "/api/v1/upload",
  createProxyMiddleware({
    target: UPLOAD_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use('/uploads', createProxyMiddleware({
  target: UPLOAD_SERVICE_URL,
  changeOrigin: true,
}));

app.use('/socket.io', createProxyMiddleware({
  target: CHAT_SERVICE_URL,
  changeOrigin: true,
  ws: true, 
  proxyTimeout: 30_000,
  timeout: 30_000,
  onError: (err, req, res) => {
    console.error('Socket.IO proxy error:', err?.message || err);
    if (res && !res.headersSent) {
      res.writeHead(504);
    }
    res?.end?.('Gateway Timeout');
  },
  pathRewrite: (path) => (path.startsWith('/socket.io') ? path : `/socket.io${path}`),
}));

const PORT = Number(process.env.PORT) || Number(process.env.GATEWAY_PORT) || 5050;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});