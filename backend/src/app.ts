import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  const allowedOrigins = new Set([
    ...env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:19006',
    'https://explorefusion.online',
    'https://www.explorefusion.online'
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):(517\d|8081|19006)$/.test(origin ?? '');

        if (!origin || allowedOrigins.has(origin) || (env.NODE_ENV === 'development' && isLocalDevOrigin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'wandermatch-api' });
  });

  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
