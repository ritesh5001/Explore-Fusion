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
  })
);

app.use(
  '/api/v1/packages',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
  })
);

app.use(
  '/api/v1/bookings',
  createProxyMiddleware({
    target: 'http://localhost:5003',
    changeOrigin: true,
  })
);

app.use('/api/v1/upload', createProxyMiddleware({
  target: 'http://localhost:5005',
  changeOrigin: true,
}));

app.use('/uploads', createProxyMiddleware({
  target: 'http://localhost:5005',
  changeOrigin: true,
}));

app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:5006',
  changeOrigin: true,
  ws: true, 
  pathRewrite: (path) => `/socket.io${path}`,
}));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});