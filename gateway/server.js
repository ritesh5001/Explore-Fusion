const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const securityMiddleware = require('./middleware/security');

dotenv.config();

const app = express();

app.use(securityMiddleware());

const isProd = process.env.NODE_ENV === 'production';

const serviceUrl = (envKey, devFallback, { requiredInProd = true } = {}) => {
  const value = process.env[envKey];
  if (value) return value;
  if (!isProd) return devFallback;
  if (requiredInProd) {
    throw new Error(`${envKey} is required in production`);
  }
  return null;
};

const disabledRoute = (message) => (req, res) => {
  res.status(503).json({
    success: false,
    message,
  });
};

const proxyJsonBody = (proxyReq, req) => {
  const method = String(req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) return;
  if (!req.body || typeof req.body !== 'object') return;

  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
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

// Core services (required in prod)
const AUTH_SERVICE_URL = serviceUrl('AUTH_SERVICE_URL', 'http://localhost:5001');
const POST_SERVICE_URL = serviceUrl('POST_SERVICE_URL', 'http://localhost:5002');
const BOOKING_SERVICE_URL = serviceUrl('BOOKING_SERVICE_URL', 'http://localhost:5003');

// Optional services (allow gateway to boot even if not deployed yet)
const ADMIN_SERVICE_URL = serviceUrl('ADMIN_SERVICE_URL', 'http://localhost:5007', { requiredInProd: false });

// Matches/Notifications can run as separate services in production.
// If not configured, fall back to booking-service (still safe in production because BOOKING_SERVICE_URL is required).
const MATCHES_SERVICE_URL = process.env.MATCHES_SERVICE_URL || BOOKING_SERVICE_URL;
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || BOOKING_SERVICE_URL;

const AI_SERVICE_URL = serviceUrl('AI_SERVICE_URL', 'http://localhost:5004', { requiredInProd: false });
const UPLOAD_SERVICE_URL = serviceUrl('UPLOAD_SERVICE_URL', 'http://localhost:5005', { requiredInProd: false });
const CHAT_SERVICE_URL = serviceUrl('CHAT_SERVICE_URL', 'http://localhost:5006', { requiredInProd: false });

if (ADMIN_SERVICE_URL) {
  app.use(
    '/api/v1/admin',
    createProxyMiddleware({
      target: ADMIN_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/admin${path}`,
    })
  );
} else {
  app.use('/api/v1/admin', disabledRoute('Admin service is not configured'));
}
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
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
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/imagekit-auth${path}`,
  })
);

app.use(
  '/api/v1/users',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
  })
);

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
  })
);
app.use(
  '/api/v1/posts',
  createProxyMiddleware({
    target: POST_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: {
      '^/api/v1/posts': '',
    },
  })
);

app.use(
  '/api/v1/ai',
  AI_SERVICE_URL
    ? createProxyMiddleware({
        target: AI_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: proxyJsonBody,
        pathRewrite: {
          '^/api/v1/ai': '',
        },
      })
    : disabledRoute('AI service is not configured')
);

app.use(
  '/api/v1/itineraries',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/itineraries${path}`,
  })
);

app.use(
  '/api/v1/packages',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/packages${path}`,
  })
);

app.use(
  '/api/v1/bookings',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/bookings${path}`,
  })
);

app.use(
  '/api/v1/reviews',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/reviews${path}`,
  })
);

app.use(
  '/api/v1/matches',
  createProxyMiddleware({
    target: MATCHES_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/matches${path}`,
  })
);

app.use(
  '/api/v1/notifications',
  createProxyMiddleware({
    target: NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: (path) => `/api/v1/notifications${path}`,
  })
);

app.use(
  '/api/v1/upload',
  UPLOAD_SERVICE_URL
    ? createProxyMiddleware({
        target: UPLOAD_SERVICE_URL,
        changeOrigin: true,
      })
    : disabledRoute('Upload service is not configured')
);

app.use(
  '/uploads',
  UPLOAD_SERVICE_URL
    ? createProxyMiddleware({
        target: UPLOAD_SERVICE_URL,
        changeOrigin: true,
      })
    : disabledRoute('Upload service is not configured')
);

app.use(
  '/socket.io',
  CHAT_SERVICE_URL
    ? createProxyMiddleware({
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
      })
    : disabledRoute('Chat service is not configured')
);

const PORT = Number(process.env.PORT) || Number(process.env.GATEWAY_PORT) || 5050;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});