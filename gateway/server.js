const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Explore Fusion Gateway is running');
});
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': '',
    },
  })
);
app.use(
  '/auth',
  createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  })
);
app.use(
  '/api/v1/posts',
  createProxyMiddleware({
    target: 'http://localhost:5002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/posts': '',
    },
  })
);

app.use(
  '/api/v1/ai',
  createProxyMiddleware({
    target: 'http://localhost:5004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/ai': '',
    },
  })
);

app.use(
  '/api/v1/itineraries',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/itineraries${path}`,
  })
);

app.use(
  '/api/v1/packages',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/packages${path}`,
  })
);

app.use(
  '/api/v1/bookings',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
    pathRewrite: (path) => `/api/v1/bookings${path}`,
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});