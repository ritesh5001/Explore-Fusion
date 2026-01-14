const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const securityMiddleware = require('./middleware/security');

dotenv.config();

const app = express();

app.use(securityMiddleware());

const isProd = process.env.NODE_ENV === 'production';

const getFetch = () => {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch;
  return async (...args) => {
    const mod = await import('node-fetch');
    return mod.default(...args);
  };
};

const serviceUrl = (envKey, devFallback) => {
  const value = process.env[envKey];
  if (value) return value;
  if (!isProd) return devFallback;
  return null;
};

const disabledRoute = (service) => (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Service not configured',
    service,
  });
};

const disabledAiRoute = (req, res) => {
  res.status(503).json({
    success: false,
    message: 'AI service not configured',
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
const ADMIN_SERVICE_URL = serviceUrl('ADMIN_SERVICE_URL', 'http://localhost:5007');
const AI_SERVICE_URL = serviceUrl('AI_SERVICE_URL', 'http://localhost:5004');
const UPLOAD_SERVICE_URL = serviceUrl('UPLOAD_SERVICE_URL', 'http://localhost:5005');
const CHAT_SERVICE_URL = serviceUrl('CHAT_SERVICE_URL', 'http://localhost:5006');
const NOTIFICATION_SERVICE_URL = serviceUrl('NOTIFICATION_SERVICE_URL', 'http://localhost:5008');
const MATCHES_SERVICE_URL = serviceUrl('MATCHES_SERVICE_URL', 'http://localhost:5009');

const coreServiceGuard = (name, url) => {
  if (url) return null;
  return disabledRoute(name);
};

if (ADMIN_SERVICE_URL) {
  app.use(
    '/api/v1/admin',
    createProxyMiddleware({
      target: ADMIN_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
    })
  );
} else {
  app.use('/api/v1/admin', disabledRoute('admin'));
}
app.use(
  '/api/v1/auth',
  coreServiceGuard('auth', AUTH_SERVICE_URL) ||
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
  coreServiceGuard('auth', AUTH_SERVICE_URL) ||
    createProxyMiddleware({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/imagekit-auth${path}`,
    })
);

app.use(
  '/api/v1/users',
  coreServiceGuard('auth', AUTH_SERVICE_URL) ||
    createProxyMiddleware({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
    })
);

app.use(
  '/auth',
  coreServiceGuard('auth', AUTH_SERVICE_URL) ||
    createProxyMiddleware({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
    })
);
app.use(
  '/api/v1/posts',
  coreServiceGuard('post', POST_SERVICE_URL) ||
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
  (req, res, next) => next()
);

const aiProxy =
  AI_SERVICE_URL &&
  createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: proxyJsonBody,
    pathRewrite: {
      '^/api/v1/ai': '',
    },
  });

// Explicit route required by system design.
app.post('/api/v1/ai/chat', (req, res, next) => {
  if (!AI_SERVICE_URL || !aiProxy) return disabledAiRoute(req, res);
  return aiProxy(req, res, next);
});

// Proxy the rest of /api/v1/ai/* to the AI service.
app.use('/api/v1/ai', aiProxy || disabledAiRoute);

app.use(
  '/api/v1/itineraries',
  coreServiceGuard('booking', BOOKING_SERVICE_URL) ||
    createProxyMiddleware({
      target: BOOKING_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/itineraries${path}`,
    })
);

app.use(
  '/api/v1/packages',
  coreServiceGuard('booking', BOOKING_SERVICE_URL) ||
    createProxyMiddleware({
      target: BOOKING_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/packages${path}`,
    })
);

app.use(
  '/api/v1/bookings',
  coreServiceGuard('booking', BOOKING_SERVICE_URL) ||
    createProxyMiddleware({
      target: BOOKING_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/bookings${path}`,
    })
);

app.use(
  '/api/v1/reviews',
  coreServiceGuard('booking', BOOKING_SERVICE_URL) ||
    createProxyMiddleware({
      target: BOOKING_SERVICE_URL,
      changeOrigin: true,
      onProxyReq: proxyJsonBody,
      pathRewrite: (path) => `/api/v1/reviews${path}`,
    })
);

app.use(
  '/api/v1/matches',
  MATCHES_SERVICE_URL
    ? createProxyMiddleware({
        target: MATCHES_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: proxyJsonBody,
        pathRewrite: (path) => `/api/v1/matches${path}`,
      })
    : disabledRoute('matches')
);

app.use(
  '/api/v1/notifications',
  NOTIFICATION_SERVICE_URL
    ? createProxyMiddleware({
        target: NOTIFICATION_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: proxyJsonBody,
        pathRewrite: (path) => `/api/v1/notifications${path}`,
      })
    : disabledRoute('notification')
);

app.use(
  '/api/v1/upload',
  UPLOAD_SERVICE_URL
    ? createProxyMiddleware({
        target: UPLOAD_SERVICE_URL,
        changeOrigin: true,
      })
    : disabledRoute('upload')
);

app.use(
  '/uploads',
  UPLOAD_SERVICE_URL
    ? createProxyMiddleware({
        target: UPLOAD_SERVICE_URL,
        changeOrigin: true,
      })
    : disabledRoute('upload')
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
    : disabledRoute('chat')
);

const PORT = Number(process.env.PORT) || Number(process.env.GATEWAY_PORT) || 5050;
const server = app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);

  // Render free-tier services can spin down when idle. Ping each deployed service periodically to keep them warm.
  // Production-only: never affects local development.
  if (process.env.NODE_ENV === 'production') {
    const keepAliveUrls = [
      'https://explore-fusion-gateway.onrender.com/health',
      'https://explore-fusion-auth.onrender.com/health',
      'https://explore-fusion-booking.onrender.com/health',
      'https://explore-fusion-post.onrender.com/health',
      'https://explore-fusion-chat.onrender.com/health',
      'https://explore-fusion-ai.onrender.com/health',
      'https://explore-fusion-upload.onrender.com/health',
      'https://explore-fusion-admin.onrender.com/health',
      'https://explore-fusion-notification.onrender.com/health',
      'https://explore-fusion-matches.onrender.com/health',
    ];

    if (AI_SERVICE_URL) {
      keepAliveUrls.push(`${String(AI_SERVICE_URL).replace(/\/$/, '')}/health`);
    }

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

    // Ping every 5 minutes
    const interval = setInterval(ping, 5 * 60 * 1000);
    interval.unref?.();

    // Also ping once on startup
    ping();
  }
});

server.on('error', (err) => {
  console.error('Gateway server error:', err);
});