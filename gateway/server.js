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

const serviceUrl = (envKey, devFallback, prodFallback) => {
  const value = process.env[envKey];
  if (value) return value;
  if (isProd) return prodFallback || null;
  return devFallback || null;
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

  if (!req.body || typeof req.body !== 'object') return;

  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json')) return;

  const bodyData = JSON.stringify(req.body);
  if (!bodyData || bodyData === '{}') return;

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
const AUTH_SERVICE_URL = serviceUrl('AUTH_SERVICE_URL', 'http://localhost:5001', 'http://auth-service:5050');
const POST_SERVICE_URL = serviceUrl('POST_SERVICE_URL', 'http://localhost:5002', 'http://post-service:5050');
const BOOKING_SERVICE_URL = serviceUrl('BOOKING_SERVICE_URL', 'http://localhost:5003', 'http://booking-service:5050');

// Optional services (allow gateway to boot even if not deployed yet)
const ADMIN_SERVICE_URL = serviceUrl('ADMIN_SERVICE_URL', 'http://localhost:5007', 'http://admin-service:5050');
const AI_SERVICE_URL = serviceUrl('AI_SERVICE_URL', 'http://localhost:5004', 'http://ai-service:5050');
const UPLOAD_SERVICE_URL = serviceUrl('UPLOAD_SERVICE_URL', 'http://localhost:5005', 'http://upload-service:5050');
const CHAT_SERVICE_URL = serviceUrl('CHAT_SERVICE_URL', 'http://localhost:5006', 'http://chat-service:5050');
const NOTIFICATION_SERVICE_URL = serviceUrl('NOTIFICATION_SERVICE_URL', 'http://localhost:5008', 'http://notification-service:5050');
const MATCHES_SERVICE_URL = serviceUrl('MATCHES_SERVICE_URL', 'http://localhost:5009', 'http://matches-service:5050');
const SOCIAL_SERVICE_URL = serviceUrl('SOCIAL_SERVICE_URL', 'http://localhost:5010', 'http://social-service:5050');

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
      secure: false,
      logLevel: 'debug',
      onProxyReq: proxyJsonBody,
    })
);

// ImageKit auth: Client -> Gateway -> Upload Service -> ImageKit
// GET /api/v1/imagekit-auth
// Proxies to: ${UPLOAD_SERVICE_URL}/imagekit-auth
const proxyImagekitAuth = async (req, res) => {
  if (!UPLOAD_SERVICE_URL) {
    return res.status(503).json({
      success: false,
      message: 'Upload service not configured',
    });
  }

  try {
    const fetch = getFetch();
    const targetUrl = `${String(UPLOAD_SERVICE_URL).replace(/\/$/, '')}/imagekit-auth`;

    const method = String(req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

    const upstream = await fetch(targetUrl, {
      method,
      headers: {
        // Forward auth if present (not required, but supported)
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
    });

    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return res.status(upstream.status).json(
        payload || {
          success: false,
          message: 'Failed to generate ImageKit auth',
        }
      );
    }

    return res.json(payload);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: error?.message || 'Upload service unavailable',
    });
  }
};

app.get('/api/v1/imagekit-auth', proxyImagekitAuth);
app.post('/api/v1/imagekit-auth', proxyImagekitAuth);

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
      secure: false,
      onProxyReq: proxyJsonBody,
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
        secure: false,
        onProxyReq: proxyJsonBody,
      })
    : disabledRoute('matches')
);

app.use(
  '/api/v1/notifications',
  NOTIFICATION_SERVICE_URL
    ? createProxyMiddleware({
        target: NOTIFICATION_SERVICE_URL,
        changeOrigin: true,
        secure: false,
        onProxyReq: proxyJsonBody,
      })
    : disabledRoute('notification')
);

// Follow system: expose under /api/v1/follow/*
// - POST   /api/v1/follow/:id          -> social-service POST /api/v1/follow/:id
// - DELETE /api/v1/follow/:id          -> social-service DELETE /api/v1/unfollow/:id
// - GET    /api/v1/follow/followers/:id -> social-service GET /api/v1/followers/:id
// - GET    /api/v1/follow/following/:id -> social-service GET /api/v1/following/:id
app.use(
  '/api/v1/follow',
  SOCIAL_SERVICE_URL
    ? createProxyMiddleware({
        target: SOCIAL_SERVICE_URL,
        changeOrigin: true,
        onProxyReq: proxyJsonBody,
        pathRewrite: (path, req) => {
          const method = String(req?.method || 'GET').toUpperCase();
          // Express strips the mount path, so `path` is typically like '/:id' or '/followers/:id'.
          if (path.startsWith('/followers/') || path === '/followers') {
            return `/api/v1${path}`;
          }
          if (path.startsWith('/following/') || path === '/following') {
            return `/api/v1${path}`;
          }
          if (method === 'DELETE') {
            return `/api/v1/unfollow${path}`;
          }
          // Default: follow
          return `/api/v1/follow${path}`;
        },
      })
    : disabledRoute('social')
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
      'https://explore-fusion-social.onrender.com/health',
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